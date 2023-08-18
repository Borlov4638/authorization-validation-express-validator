import { Request, Response, Router } from "express";
import { blogsDB } from "../db/blogs.db";
import { RequestWithBody, RequestWithParam, RequestWithParamAndBody } from "../../types/blogs.request.types";
import { validationResult } from "express-validator";
import { blogDescriptionValidation, blogNameValidation, blogUrlMatchingValidation, blogUrlValidation } from "../validation/blog.validatiom";
import { authLoginValidationMiddleware, authPasswordValidationMiddleware } from "../../auth/auth.middleware";





export const blogsRouter : Router = Router({})

blogsRouter.get('/', (req:Request, res: Response) => {

    res.status(200).send(blogsDB)
})

blogsRouter.get('/:id', (req:RequestWithParam<{id:string}>, res:Response) => {
    const findedBlog = blogsDB.find(blog => blog.id === req.params.id)

    if (findedBlog){
        res.status(200).send(findedBlog)
    }else{
        res.sendStatus(404)
    }
})

blogsRouter.post('/',
    authLoginValidationMiddleware(),
    authPasswordValidationMiddleware(),
    blogNameValidation(),
    blogDescriptionValidation(),
    blogUrlValidation(),
    blogUrlMatchingValidation(),
    
    
    async (req: RequestWithBody<{name:string, description:string, websiteUrl:string}>, res:Response) =>{
    
        const result = validationResult(req)

        const unathorised = result.array().find(error => error.msg === '401')

        if(unathorised){
            return res.sendStatus(401)
        }

        if(!result.isEmpty()){
            return res.status(400).send({errorsMessages:result.array({onlyFirstError:true}).map(error => error.msg)})
        }

        const newBlog = 
        {
            id: (+new Date()).toString(),
            name: req.body.name,
            description: req.body.description,
            websiteUrl: req.body.websiteUrl
        }

        blogsDB.push(newBlog)
        return res.status(201).send(newBlog)

})

blogsRouter.put('/:id',
    authLoginValidationMiddleware(),
    authPasswordValidationMiddleware(),
    blogNameValidation(),
    blogDescriptionValidation(),
    blogUrlValidation(),
    blogUrlMatchingValidation(),


    async (req: RequestWithParamAndBody<{id:string},{name:string, description:string, websiteUrl:string}>, res:Response) =>{
        


        const result = validationResult(req)
        const unathorised = result.array().find(error => error.msg === '401')

        if(unathorised){
            return res.sendStatus(401)
        }

        const findBlogToUpdate = blogsDB.find(blog => blog.id === req.params.id)

        if(!findBlogToUpdate){
            return res.sendStatus(404)
        }

        if(!result.isEmpty()){
            return res.status(400).send({errorsMessages:result.array({onlyFirstError:true}).map(error => error.msg)})
        }

        findBlogToUpdate.description = req.body.description
        findBlogToUpdate.name = req.body.name
        findBlogToUpdate.websiteUrl = req.body.websiteUrl

        return res.sendStatus(204)
})

blogsRouter.delete('/:id',
    authLoginValidationMiddleware(),
    authPasswordValidationMiddleware(),
    (req:Request, res:Response) =>{

    const result = validationResult(req)
    const unathorised = result.array().find(error => error.msg === '401')

    if(unathorised){
        return res.sendStatus(401)
    }

    const findBlogToUpdate = blogsDB.find(blog => blog.id === req.params.id)

    if(!findBlogToUpdate){
        return res.sendStatus(404)
    }

    blogsDB.splice(blogsDB.indexOf(findBlogToUpdate), 1)

    return res.sendStatus(204)
})


