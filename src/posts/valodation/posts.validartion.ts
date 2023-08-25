import { body } from "express-validator"
import { client } from "../../blogs/db/db.init"
import { NextFunction, Request, Response } from "express"
import { ObjectId } from "mongodb"

export const postTitleValidation = () => body('title').exists({values:"falsy"}).withMessage({message: 'title not passed', field:"title"}).isString().trim().isLength({min:1, max:30}).withMessage({message: 'Invalid title', field:"title"})
export const postShortDescriptionValidation = () => body('shortDescription').exists({values:"falsy"}).withMessage({message: 'shortDescription not passed', field:"shortDescription"}).isString().trim().isLength({min:1, max:100}).withMessage({message: 'Invalid shortDescription', field:"shortDescription"})
export const postContenteValidation = () => body('content').exists({values:"falsy"}).withMessage({message: 'Content not passed', field:"content"}).isString().trim().isLength({min:1, max:1000}).withMessage({message: 'Invalid content', field:"content"})
export const postBlogIdValidation = () => body('blogId').exists({values:"falsy"}).withMessage({message: 'blogId not passed', field:"blogId"}).isString().matches(/^[a-f\d]{24}$/i).withMessage({message: 'Invalid blogId', field:"blogId"})
    .custom(async (value, {req}) =>{
        const blogToFetch = await client.db("incubator").collection("blogs").findOne({_id: new ObjectId(req.body.blogId)})
        if(!blogToFetch){
            throw new Error()
        }
        return true
    
    }).withMessage({message: 'Invalid blogId', field:"blogId"})

export const postIsExistsById = async (req: Request, res: Response, next:NextFunction) => {
    
    const postToFetch = await client.db("incubator").collection("posts").findOne({_id: new ObjectId(req.params.id)})
    if(!postToFetch){
        return res.sendStatus(404)
    }
    return next()
}

