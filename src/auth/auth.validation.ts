import { body } from "express-validator";

export const authPasswordValidation = () => body('password').exists().withMessage({message:"password is not passed", field:"password"}).isString().isLength({min:1}).withMessage({message:"password is invalid", field:"password"})
export const authLoginOrEmailValidation = () => body('loginOrEmail').exists().withMessage({message:"login or email is not passed", field:"loginOrEmail"}).isString().isLength({min:1}).withMessage({message:"login or email is invalid", field:"loginOrEmail"})