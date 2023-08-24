import { Request, Response, Router } from "express";
import { RequestWithBody, RequestWithParam, RequestWithParamAndBody } from "../../types/blogs.request.types";
import { validationResult } from "express-validator";
import { blogDescriptionValidation, blogNameValidation, blogUrlMatchingValidation, blogUrlValidation, validationResultMiddleware } from "../validation/blog.validatiom";
import { authValidationMiddleware } from "../../auth/auth.middleware";
import { client } from "../db/db.init";

export const blogsRouter : Router = Router({})

blogsRouter.get('/', async (req:Request, res: Response) => {
    const blogsToSend = await client.db("incubator").collection("blogs").find({ },{projection:{_id:0}}).toArray()
    res.status(200).send(blogsToSend)
})

blogsRouter.get('/:id', async (req:RequestWithParam<{id:string}>, res:Response) => {
    const findedBlog = await client.db("incubator").collection("blogs").findOne({id: req.params.id}, {projection:{_id:0}})

    if (findedBlog){
        res.status(200).send(findedBlog)
    }else{
        res.sendStatus(404)
    }
})

blogsRouter.post('/',
    authValidationMiddleware,
    blogNameValidation(),
    blogDescriptionValidation(),
    blogUrlValidation(),
    blogUrlMatchingValidation(),
    validationResultMiddleware,
    
    async (req: RequestWithBody<{name:string, description:string, websiteUrl:string}>, res:Response) =>{
    
        const newBlog = 
        {
            id: (+new Date()).toString(),
            name: req.body.name,
            description: req.body.description,
            websiteUrl: req.body.websiteUrl,
            createdAt: (new Date()).toISOString(),
            isMembership: false
        }

        res.status(201).send(newBlog)

        return await client.db("incubator").collection("blogs").insertOne(newBlog)
})

blogsRouter.put('/:id',
    authValidationMiddleware,
    blogNameValidation(),
    blogDescriptionValidation(),
    blogUrlValidation(),
    blogUrlMatchingValidation(),
    validationResultMiddleware,

    async (req: RequestWithParamAndBody<{id:string},{name:string, description:string, websiteUrl:string}>, res:Response) =>{
        
        const findBlogToUpdate = await client.db("incubator").collection("blogs").findOne({id: req.params.id})

        if(!findBlogToUpdate){
            return res.sendStatus(404)
        }

        await client.db("incubator").collection("blogs").updateOne({id: req.params.id}, {$set:{websiteUrl:req.body.websiteUrl ,name:req.body.name, description: req.body.description}})
        
        return res.sendStatus(204)
})

blogsRouter.delete('/:id',
    authValidationMiddleware,
    async (req:Request, res:Response) =>{

    const findBlogToDelete = await client.db("incubator").collection("blogs").findOne({id: req.params.id})

    if(!findBlogToDelete){
        return res.sendStatus(404)
    }

    client.db("incubator").collection("blogs").deleteOne({id: req.params.id})

    return res.sendStatus(204)
})


