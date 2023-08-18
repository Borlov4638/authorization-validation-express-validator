import { ExpressValidator, header } from "express-validator";
export const authValidationMiddleware = () => header('Authorization').custom((value, ) =>{
    if(value !== 'Basic YWRtaW46cXdlcnR5'){
        throw new Error('401')
    }
    return true
})

