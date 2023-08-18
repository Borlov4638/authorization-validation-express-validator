import { ExpressValidator, header } from "express-validator";
export const authLoginValidationMiddleware = () => header('login').custom((value, ) =>{
    if(value !== 'admin'){
        throw new Error('401')
    }
    return true
})

export const authPasswordValidationMiddleware = () => header('password').custom((value, {req}) =>{
    if(value !== 'qwerty'){
        throw new Error('401')
    }
    return true
})