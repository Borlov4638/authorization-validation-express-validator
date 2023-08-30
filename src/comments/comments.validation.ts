import { body } from "express-validator";

export const commentsContentValidation = () => body('content').exists().withMessage({message: 'Invalid content', field:"content"}).isString().isLength({max:300, min:20}).withMessage({message: 'Invalid content', field:"content"})
