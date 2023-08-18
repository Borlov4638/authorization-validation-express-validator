import { body } from "express-validator"

export const blogNameValidation = () => body('name').isString().trim().isLength({min:1,max:15}).withMessage({message: 'Invalid name', field:"name"})

export const blogDescriptionValidation = () => body('description').isString().trim().isLength({min:1,max:500}).withMessage({message: 'Invalid description', field:"description"})

export const blogUrlValidation = () => body('websiteUrl').isString().trim().isLength({min:1,max:100}).withMessage({message: 'Invalid websiteUrl', field:"websiteUrl"})

export const blogUrlMatchingValidation = () => body('websiteUrl').matches(/^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/).withMessage({message: 'Invalid websiteUrl', field:"websiteUrl"})
