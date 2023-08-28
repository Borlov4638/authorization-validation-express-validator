import { Response, Router } from "express";
import { RequestWithBody } from "../types/blogs.request.types";
import { client } from "../blogs/db/db.init";
import * as bcrypt from "bcrypt"
import { authLoginOrEmailValidation, authPasswordValidation } from "./auth.validation";
import { validationResultMiddleware } from "../blogs/validation/blog.validatiom";

export const authRouter = Router({})

authRouter.post('/login',
    authLoginOrEmailValidation(),
    authPasswordValidation(),
    validationResultMiddleware,
    async (req:RequestWithBody<{loginOrEmail:string, password:string}>, res:Response) =>{

        const userNameOrEmail = await client.db('incubator').collection('users').findOne({$or:[{login: req.body.loginOrEmail}, {email: req.body.loginOrEmail}]})

        if (!userNameOrEmail){
            return res.sendStatus(401)
        }
        else
            {
                return await bcrypt.hash(req.body.password, userNameOrEmail.salt) !== userNameOrEmail.password ? res.sendStatus(401) : res.sendStatus(204)              
            }
})