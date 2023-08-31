import { Request, Response, Router } from "express";
import { authLoginOrEmailValidation, authPasswordValidation } from "./auth.validation";
import { validationResultMiddleware } from "../blogs/validation/blog.validatiom";
import { authService } from "./auth.service";
import { jwtService } from "../app/jwt.service";
import { RequestWithBody } from "../types/blogs.request.types";
import { JwtPayload } from "jsonwebtoken";
import { usersEmailValidation, usersLoginValidation, usersPasswordValidation } from "../users/users.validation";


export const authRouter = Router({})

authRouter.post('/login',
    authLoginOrEmailValidation(),
    authPasswordValidation(),
    validationResultMiddleware,
    async (req:RequestWithBody<{loginOrEmail:string, password:string}>, res:Response) =>{

        const userIsValid = await authService.checkCredentials(req.body.loginOrEmail, req.body.password)

        if(userIsValid){

            const token = jwtService.createToken(userIsValid)
            res.status(200).send({accessToken:token})
        }
        else{
            res.sendStatus(401)
        }
})

authRouter.get('/me', (req:Request, res:Response) =>{

    if(req.headers.authorization){

        const token : JwtPayload | null = jwtService.getUserByToken(req.headers.authorization)
        
        return token ? res.status(201).send(token) : res.sendStatus(401) 
    }

    return res.sendStatus(401)

})

authRouter.post('/regisrtation',
    usersLoginValidation(),
    usersEmailValidation(),
    usersPasswordValidation(),
    validationResultMiddleware,
    async (req:RequestWithBody<{login:string, password:string, email:string}>, res: Response) =>{

        const subject = "Registration conformation ✔"
        const message = "<b>Confirm your registration</b>"
    
        authService.sendMail(req.body.email, subject, message)
        
        res.sendStatus(204)
})