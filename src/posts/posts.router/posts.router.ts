import { Request, Response, Router } from "express";
import { postsDB } from "../db/posts.db";
import { RequestWithBody, RequestWithParam, RequestWithParamAndBody } from "../../types/blogs.request.types";
import { validationResult } from "express-validator";
import { blogsDB } from "../../blogs/db/blogs.db";
import { authBlogIsExistsValidationMiddleware, postBlogIdValidation, postContenteValidation, postShortDescriptionValidation, postTitleValidation } from "../valodation/posts.validartion";
import { authValidationMiddleware } from "../../auth/auth.middleware";

export const postRouter = Router({})

postRouter.get('/', (req :Request, res :Response) =>{
    res.status(200).send(postsDB)
})

postRouter.get('/:id', (req : RequestWithParam<{id:string}>, res: Response) =>{
    const foundedPost = postsDB.find(post => post.id === req.params.id)

    if(!foundedPost){
        return res.sendStatus(404)
    }

    return res.status(200).send(foundedPost)
})

postRouter.post('/',
    authValidationMiddleware(),
    postTitleValidation(),
    postShortDescriptionValidation(),
    postContenteValidation(),
    postBlogIdValidation(),
    authBlogIsExistsValidationMiddleware(),

    (req:RequestWithBody<{title:string, shortDescription:string, content:string, blogId:string}>, res :Response) =>{
    
    const result = validationResult(req)
    
    const unathorised = result.array().find(error => error.msg === '401')

    if(unathorised){
        return res.sendStatus(401)
    }

    if(!result.isEmpty()){
        return res.status(400).send({errorsMessages:result.array({onlyFirstError:true}).map(error => error.msg)})
    }
    
    const blogToFetch  = blogsDB.find(blog => blog.id === req.body.blogId)

    if(!blogToFetch){
        return res.status(400).send({errorsMessages:[{message: 'no such blog', field:'blogId'}]})
    }

    const newPost = {
        id: (+new Date()).toString(),
        title: req.body.title,
        shortDescription: req.body.shortDescription,
        content: req.body.content,
        blogId: blogToFetch.id,
        blogName: blogToFetch.name
    }
    
    postsDB.push(newPost)
    return res.status(201).send(newPost)
})

postRouter.put('/:id',
    authValidationMiddleware(),
    postTitleValidation(),
    postShortDescriptionValidation(),
    postContenteValidation(),
    postBlogIdValidation(),
    authBlogIsExistsValidationMiddleware(),
    (req:RequestWithParamAndBody<{id:string},{title:string, shortDescription:string, content:string, blogId:string}>, res :Response) =>{
    const postToUpdate = postsDB.find(post => post.id === req.params.id)
    
    const result = validationResult(req)
    console.log(req.headers.authorization)

    const unathorised = result.array().find(error => error.msg === '401')

    if(unathorised){
        return res.sendStatus(401)
    }

    if(!result.isEmpty()){
        return res.status(400).send({errorsMessages:result.array({onlyFirstError:true}).map(error => error.msg)})
    }


    if(!postToUpdate){
        return res.sendStatus(404)
    }

    

    const blogToFetch = blogsDB.find(blog => blog.id === req.body.blogId)

    if(!blogToFetch){
        return res.status(400).send({errorsMessages:[{message: 'no such blog', field:'blogId'}]})
    }

    postToUpdate.title = req.body.title
    postToUpdate.shortDescription = req.body.shortDescription
    postToUpdate.content = req.body.content
    postToUpdate.blogId = blogToFetch.id
    postToUpdate.blogName =  blogToFetch.name

    return res.sendStatus(204)

})

postRouter.delete('/:id',
    authValidationMiddleware(),
    (req:Request, res:Response) =>{
    const postToDelete = postsDB.find(post => post.id === req.params.id)

    const result = validationResult(req)

    const unathorised = result.array().find(error => error.msg === '401')

    if(unathorised){
        return res.sendStatus(401)
    }

    if(!postToDelete){
        return res.sendStatus(404)
    }
    postsDB.splice(postsDB.indexOf(postToDelete), 1)
    return res.sendStatus(204)
})