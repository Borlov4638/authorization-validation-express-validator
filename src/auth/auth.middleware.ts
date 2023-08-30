import { NextFunction, Request, Response } from "express";
import * as bcrypt from 'bcrypt'
import { RequestWithParamAndBody, RequestWithQuery } from "../types/blogs.request.types";
import { jwtService, jwtUser } from "../app/jwt.service";


export const authValidationMiddleware = async (req:Request | RequestWithQuery<{}>, res: Response, next: NextFunction) => {
    if(req.headers.authorization) {
        return (await bcrypt.compare(req.headers.authorization, '$2b$05$iVNXGbhdkw823twlWAPuzO8m7wLpvbHoOcz98YcdCL8mqyPnNrvDq')) ? next() : res.sendStatus(401)
    }
    return res.sendStatus(401)
}

export const bearerAuthorization = async (req:RequestWithParamAndBody<{}, {}>, res:Response, next:NextFunction) =>{
        
    if(!req.headers.authorization){
        return res.sendStatus(401)
    }

    const isAuthorized = jwtService.getUserByToken(req.headers.authorization) as jwtUser

    if(!isAuthorized){
        return res.sendStatus(401)
    }

    return next()
}

