import { NextFunction, Request, Response } from "express";
import { ExpressValidator, header } from "express-validator";


export const authValidationMiddleware = (req:Request, res: Response, next: NextFunction) => {
    if(req.headers.authorization !== 'Basic YWRtaW46cXdlcnR5') {
        return res.sendStatus(404)
    }
    return true
}



// export const authValidationMiddleware = () => header('Authorization').custom((value, ) =>{
//     if(value !== 'Basic YWRtaW46cXdlcnR5'){
//         throw new Error('401')
//     }
//     return true
// })

