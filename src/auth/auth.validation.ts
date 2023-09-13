import { body } from "express-validator";
import { jwtService } from "../app/jwt.service";

export const authPasswordValidation = () => body('password').exists().withMessage({message:"password is not passed", field:"password"}).isString().isLength({min:1}).withMessage({message:"password is invalid", field:"password"})
export const authLoginOrEmailValidation = () => body('loginOrEmail').exists().withMessage({message:"login or email is not passed", field:"loginOrEmail"}).isString().isLength({min:1}).withMessage({message:"login or email is invalid", field:"loginOrEmail"})
export const authNewPasswordValidation = () => body('newPassword').exists().withMessage({message:"password is not passed", field:"newPassword"}).isString().isLength({min:6, max:20}).withMessage({message:"password is invalid", field:"newPassword"})
export const authRecoveryCodeValidation = () => body('recoveryCode').exists().withMessage({message:"recoveryCode is not passed", field:"recoveryCode"}).isString().isLength({min:1}).withMessage({message:"code must be a string", field: "recoveryCode"})
    .custom((value, {req}) =>{
        const isCodeValid = jwtService.getAllTokenData(req.body.recoveryCode)

        if(!isCodeValid){
            throw new Error()
        }
        return true
    }).withMessage({message:"recoveryCode is invalid", field:"recoveryCode"})