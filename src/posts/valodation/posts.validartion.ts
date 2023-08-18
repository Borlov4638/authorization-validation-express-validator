import { body } from "express-validator"
import { blogsDB } from "../../blogs/db/blogs.db"

export const postTitleValidation = () => body('title').exists({values:"falsy"}).withMessage({message: 'title not passed', field:"title"}).isString().trim().isLength({min:1, max:30}).withMessage({message: 'Invalid title', field:"title"})
export const postShortDescriptionValidation = () => body('shortDescription').exists({values:"falsy"}).withMessage({message: 'shortDescription not passed', field:"shortDescription"}).isString().trim().isLength({min:1, max:100}).withMessage({message: 'Invalid shortDescription', field:"shortDescription"})
export const postContenteValidation = () => body('content').exists({values:"falsy"}).withMessage({message: 'Content not passed', field:"content"}).isString().trim().isLength({min:1, max:1000}).withMessage({message: 'Invalid content', field:"content"})
export const postBlogIdValidation = () => body('blogId').exists({values:"falsy"}).withMessage({message: 'blogId not passed', field:"blogId"}).isString().withMessage({message: 'Invalid blogId', field:"blogId"})





export const authBlogIsExistsValidationMiddleware = () => body('blogId').custom((value, {req}) =>{
    const blogToFetch = blogsDB.find(blog => blog.id === req.body.blogId)

    if(!blogToFetch){
        return false
    }
    return true
}).withMessage({message: 'no such blog', field:'blogId'})