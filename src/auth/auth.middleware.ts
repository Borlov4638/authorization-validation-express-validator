import { NextFunction, Request, Response } from "express";
import * as bcrypt from 'bcrypt'
import { RequestWithQuery } from "../types/blogs.request.types";


export const authValidationMiddleware = async (req:Request | RequestWithQuery<{}>, res: Response, next: NextFunction) => {
    if(req.headers.authorization) {
        return (await bcrypt.compare(req.headers.authorization, '$2b$05$iVNXGbhdkw823twlWAPuzO8m7wLpvbHoOcz98YcdCL8mqyPnNrvDq')) ? next() : res.sendStatus(401)
    }
    return res.sendStatus(401)
}

