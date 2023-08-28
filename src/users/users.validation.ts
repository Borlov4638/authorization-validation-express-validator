import { body } from "express-validator";

export const usersLoginValidation = () => body('login').exists().withMessage({message:"login is not passed", field:"login"}).isString().isLength({min:3, max:10}).matches(/^[a-zA-Z0-9_-]*$/).withMessage({message:"invalid login", field:"login"})
export const usersPasswordValidation = () => body('password').exists().withMessage({message:"password is not passed", field:"password"}).isString().isLength({min:6, max:20}).withMessage({message:"invalid password", field:"password"})
export const usersEmailValidation = () => body('email').exists().withMessage({message:"email is not passed", field:"email"}).isString().matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/).withMessage({message:"invalid email", field:"email"})
