import { Request, Response, Router } from "express";
import { authLoginOrEmailValidation, authPasswordValidation } from "./auth.validation";
import { validationResultMiddleware } from "../blogs/validation/blog.validatiom";
import { authService } from "./auth.service";
import { jwtService } from "../app/jwt.service";
import { RequestWithBody } from "../types/blogs.request.types";
import { JwtPayload } from "jsonwebtoken";
import { usersEmailValidation, usersLoginValidation, usersPasswordValidation } from "../users/users.validation";
import { usersService } from "../users/users.service";
import { body } from "express-validator";
import { UserType } from "../types/users.type";
import { client } from "../blogs/db/db.init";


export const authRouter = Router({})

authRouter.post('/login',
    authLoginOrEmailValidation(),
    authPasswordValidation(),
    validationResultMiddleware,
    async (req:RequestWithBody<{loginOrEmail:string, password:string}>, res:Response) =>{

        const userIsValid = await authService.checkCredentials(req.body.loginOrEmail, req.body.password)

        if(userIsValid){

            const accessToken = jwtService.createToken(userIsValid, '10s')
            const refreshToken = jwtService.createToken(userIsValid, '20s')
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

        const isTokenInvalid = await client.db('incubator').collection('invalidTokens').findOne({refreshToken:req.cookies.refreshToken})

        if(isTokenInvalid){
            return res.sendStatus(401)
            
        }

        const token = jwtService.getUserByToken(req.cookies.refreshToken)

        if(token){
            token.id = token.userId
            await client.db('incubator').collection('invalidTokens').insertOne({refreshToken: req.cookies.refreshToken})
            const accessToken = jwtService.createToken(token, '10s')
            const refreshToken = jwtService.createToken(token, '20s')
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
    const oldRefreshToken = req.cookies.refreshToken

    if (!oldRefreshToken || !jwtService.getUserByToken(oldRefreshToken)){
        return 	res.sendStatus(401)
    }

    const isTokenInvalid = await client.db('incubator').collection('invalidTokens').findOne({refreshToken:oldRefreshToken})

    if(isTokenInvalid){
        return res.sendStatus(401)
    }

    await client.db('incubator').collection('invalidTokens').insertOne({refreshToken: oldRefreshToken})

    return res.sendStatus(204)
})