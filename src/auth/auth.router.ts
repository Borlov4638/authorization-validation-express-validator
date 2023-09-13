import { Request, Response, Router } from "express";
import { authLoginOrEmailValidation, authNewPasswordValidation, authPasswordValidation, authRecoveryCodeValidation } from "./auth.validation";
import { validationResultMiddleware } from "../blogs/validation/blog.validatiom";
import { authService } from "./auth.service";
import { jwtService } from "../app/jwt.service";
import { RequestWithBody } from "../types/blogs.request.types";
import { JwtPayload } from "jsonwebtoken";
import { usersEmailValidation, usersLoginValidation, usersPasswordValidation } from "../users/users.validation";
import { usersService } from "../users/users.service";
import { body } from "express-validator";
import { client } from "../blogs/db/db.init";
import uuid4 from "uuid4";
import { add, format } from "date-fns";
import { passwordService } from "../app/password.service";
import { ObjectId } from "mongodb";


export const authRouter = Router({})

authRouter.post('/login',
    authLoginOrEmailValidation(),
    authPasswordValidation(),
    validationResultMiddleware,
    async (req:RequestWithBody<{loginOrEmail:string, password:string}>, res:Response) =>{

        const userIsValid = await authService.checkCredentials(req.body.loginOrEmail, req.body.password)

        if(userIsValid){

            const requestIp = req.headers['x-forwarded-for'] as string || req.socket.remoteAddress! 

            const userAgent = (req.headers["user-agent"]) ? req.headers["user-agent"] : 'Chrome 105'

            const deviceId = uuid4()
            const refreshTokenExpirationDate = 3600
            const accessToken = jwtService.createAccessToken(userIsValid, 360)
            const refreshToken = jwtService.createRefreshToken(userIsValid, deviceId, refreshTokenExpirationDate)

            await authService.createNewSession(userIsValid.id, requestIp, userAgent, deviceId, refreshTokenExpirationDate)

            res.cookie('refreshToken', refreshToken, {httpOnly:true, secure:true})
            res.status(200).send({accessToken})
        }
        else{
            res.sendStatus(401)
        }
})

authRouter.get('/me', (req:Request, res:Response) =>{

    if(req.headers.authorization){

        const token : JwtPayload | null = jwtService.getUserByToken(req.headers.authorization)
        return token ? res.status(200).send(token) : res.sendStatus(401) 
    }

    return res.sendStatus(401)

})

authRouter.post('/registration',
    usersLoginValidation(),
    usersEmailValidation(),
    usersPasswordValidation(),
    validationResultMiddleware,
    async (req:RequestWithBody<{login:string, password:string, email:string}>, res: Response) =>{

        const subject = "Registration conformation ✔"
        
        const conformationCode = await usersService.createNewUser(req.body.login, req.body.password, req.body.email, false) as string
        await authService.sendMail(req.body.email, conformationCode)
        
        res.sendStatus(204)
})

authRouter.post('/registration-confirmation', async (req:RequestWithBody<{code:string}>, res:Response) =>{

    const confirmation = await authService.verifyUserByCode(req.body.code)
    
    if(!confirmation){
        return res.status(400).send({
            "errorsMessages": [
              {
                "message": "confirmation code is incorrect, expired or already been applied",
                "field": "code"
              }
            ]
          })
    }else{
        return res.sendStatus(204)
    }
})

authRouter.post('/registration-email-resending',
    body('email').exists().withMessage({message:"invalid email", field: "email"}).isString().matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/).withMessage({message:"invalid email", field: "email"}),
    validationResultMiddleware,
    async (req:RequestWithBody<{email:string}>, res:Response) =>{

        const emailIsResend = await authService.resendEmailForRegistration(req.body.email)

        if(emailIsResend){
            return res.sendStatus(204)
        }
        else{
            return res.status(400).send({
                "errorsMessages": [
                  {
                    "message": "email is already confirmed",
                    "field": "email"
                  }
                ]
              })
        }
})


authRouter.post('/refresh-token', async (req:RequestWithBody<{accessToken:string}>, res:Response) =>{
    try{
        if(!req.cookies.refreshToken){
            return res.sendStatus(401)
        }

        const token = jwtService.getAllTokenData(req.cookies.refreshToken)

        if(token){

            const isSessionValid = await authService.isSessionValid(token)

            if(!isSessionValid){
                return res.sendStatus(401)
            }

            token.id = token.userId
            
            const accessToken = jwtService.createAccessToken(token, 360)
            const refreshToken = jwtService.createRefreshToken(token, token.deviceId, 3600)
            
            const requestIp = req.headers['x-forwarded-for'] as string || req.socket.remoteAddress! 
            const userAgent = (req.headers["user-agent"]) ? req.headers["user-agent"] : 'Chrome 105'

            const refreshTokenExpirationDate = 20

            const lastActiveDate = Math.floor(+new Date()/1000) * 1000
            await client.db('incubator').collection('deviceSessions').findOneAndUpdate(
                {deviceId:isSessionValid.deviceId}, {$set:{...isSessionValid, ip:requestIp, title:userAgent,lastActiveDate: new Date(lastActiveDate).toISOString(), expiration: add(new Date(), {seconds:refreshTokenExpirationDate}).toISOString()  }}
            )

            res.cookie('refreshToken', refreshToken, {httpOnly:true, secure:true})
            return res.status(200).send({accessToken})
        }
        else{
            return res.sendStatus(401) 
        }
    }
    catch(err){
        console.log(err)
        return res.status(400)
    }

})

authRouter.post('/logout', async (req:Request, res:Response) =>{

    if(!req.cookies.refreshToken){
        return 	res.sendStatus(401)
    }

    const token = jwtService.getAllTokenData(req.cookies.refreshToken)

    if (!token){
        return 	res.sendStatus(401)
    }

    const isSessionValid = await authService.isSessionValid(token)

    if(!isSessionValid){
        return res.sendStatus(401)
    }

    await client.db('incubator').collection('deviceSessions').deleteOne(isSessionValid)

    return res.sendStatus(204)
})

authRouter.post('/password-recovery',
    body('email').exists().withMessage({message:"invalid email", field: "email"}).isString().matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/).withMessage({message:"invalid email", field: "email"}),
    validationResultMiddleware,
    async (req:RequestWithBody<{email:string}>, res:Response) =>{

        const emailIsResend = await authService.sendPasswordRecoweryEmail(req.body.email)

        if(emailIsResend){
            return res.sendStatus(204)
        }
        else{
            return res.status(400).send({
                "errorsMessages": [
                  {
                    "message": "email is invalid",
                    "field": "email"
                  }
                ]
              })
        }

})

authRouter.post('/new-password',
    authNewPasswordValidation(),
    authRecoveryCodeValidation(),
    validationResultMiddleware,
    async (req:RequestWithBody<{newPassword:string, recoveryCode:string}>, res:Response) =>{
        
        const isCodeValid = jwtService.getAllTokenData(req.body.recoveryCode)

        const hashedPassword = await passwordService.hashPassword(req.body.newPassword)

        await client.db('incubator').collection('users').updateOne({_id:new ObjectId(isCodeValid!.userId)}, {$set:{password:hashedPassword}})
        console.log(isCodeValid!.userId)
        return res.sendStatus(204)
})