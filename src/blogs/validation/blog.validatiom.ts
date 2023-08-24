import { NextFunction, Request, Response } from "express"
import { body, validationResult } from "express-validator"

export const blogNameValidation = () => body('name').exists({values:"falsy"}).withMessage({message: 'name not passed', field:"name"}).isString().trim().isLength({min:1,max:15}).withMessage({message: 'Invalid name', field:"name"})

export const blogDescriptionValidation = () => body('description').exists({values:"falsy"}).withMessage({message: 'description not passed', field:"description"}).isString().trim().isLength({min:1,max:500}).withMessage({message: 'Invalid description', field:"description"})

export const blogUrlValidation = () => body('websiteUrl').exists({values:"falsy"}).withMessage({message: 'websiteUrl not passed', field:"websiteUrl"}).isString().trim().isLength({min:1,max:100}).withMessage({message: 'Invalid websiteUrl', field:"websiteUrl"})

export const blogUrlMatchingValidation = () => body('websiteUrl').matches(/^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/).withMessage({message: 'Invalid websiteUrl', field:"websiteUrl"})


export const validationResultMiddleware = (req:Request, res:Response, next: NextFunction) =>{
    
    const result = validationResult(req)

    if(!result.isEmpty()){
        return res.status(400).send({errorsMessages:result.array({onlyFirstError:true}).map(error => error.msg)})
    }
    
    return next()
}