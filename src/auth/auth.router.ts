import { Request, Response, Router } from "express";
import { authLoginOrEmailValidation, authPasswordValidation } from "./auth.validation";
import { validationResultMiddleware } from "../blogs/validation/blog.validatiom";
import { authService } from "./auth.service";
import { jwtService } from "../app/jwt.service";
import { RequestWithBody } from "../types/blogs.request.types";
import { JwtPayload } from "jsonwebtoken";


export const authRouter = Router({})

authRouter.post('/login',
    authLoginOrEmailValidation(),
    authPasswordValidation(),
    validationResultMiddleware,
    async (req:RequestWithBody<{loginOrEmail:string, password:string}>, res:Response) =>{

        const userIsValid = await authService.checkCredentials(req.body.loginOrEmail, req.body.password)

        if(userIsValid){

            const token = jwtService.createToken(userIsValid)
            res.status(201).send({token})
        }
        else{
            res.sendStatus(404)
        }
})

authRouter.get('/me', (req:Request, res:Response) =>{

    if(req.headers.authorization){

        const token : JwtPayload | null = jwtService.getUserByToken(req.headers.authorization)
        
        if(token && Date.now() <= token.exp! * 1000){
            delete token.exp
            delete token.iat
            return res.status(200).send(token) 

        } else{
             return res.sendStatus(401)
            }
    }

    return res.sendStatus(401)

})