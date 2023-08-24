import { Request, Response, Router } from "express";
import { RequestWithBody, RequestWithParam, RequestWithParamAndBody } from "../../types/blogs.request.types";
import { blogDescriptionValidation, blogNameValidation, blogUrlMatchingValidation, blogUrlValidation, validationResultMiddleware } from "../validation/blog.validatiom";
import { authValidationMiddleware } from "../../auth/auth.middleware";
import { client } from "../db/db.init";
import { ObjectId } from "mongodb";

export const blogsRouter : Router = Router({})

blogsRouter.get('/', async (req:Request, res: Response) => {
    const blogsToSend = await client.db("incubator").collection("blogs").find({ },{projection:{_id:0}}).toArray()
    res.status(200).send(blogsToSend)
})

blogsRouter.get('/:id', async (req:RequestWithParam<{id:string}>, res:Response) => {

    const requestId = new ObjectId(`${req.params.id}`)

    const findedBlog = await client.db("incubator").collection("blogs").findOne({_id: requestId}, {projection:{_id:0}})

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
            name: req.body.name,
            description: req.body.description,
            websiteUrl: req.body.websiteUrl,
            createdAt: (new Date()).toISOString(),
            isMembership: false
        }

        const insertedPost = await client.db("incubator").collection("blogs").insertOne(newBlog)
        await client.db("incubator").collection("blogs").updateOne({_id:insertedPost.insertedId}, {$set:{id:insertedPost.insertedId}})
        const blogToShow = await client.db("incubator").collection("blogs").findOne({_id:insertedPost.insertedId}, {projection:{_id:0}})
        console.log(insertedPost.insertedId)
        return res.status(201).send(blogToShow)
})

blogsRouter.put('/:id',
    authValidationMiddleware,
    blogNameValidation(),
    blogDescriptionValidation(),
    blogUrlValidation(),
    blogUrlMatchingValidation(),
    validationResultMiddleware,

    async (req: RequestWithParamAndBody<{id:string},{name:string, description:string, websiteUrl:string}>, res:Response) =>{
        
        const requestId = new ObjectId(`${req.params.id}`)
        const findBlogToUpdate = client.db("incubator").collection("blogs").find({_id: requestId})

        if(!findBlogToUpdate){
            return res.sendStatus(404)
        }

        await client.db("incubator").collection("blogs").updateOne({_id: requestId}, {$set:{websiteUrl:req.body.websiteUrl ,name:req.body.name, description: req.body.description}})
        
        return res.sendStatus(204)
})

blogsRouter.delete('/:id',
    authValidationMiddleware,
    async (req:Request, res:Response) =>{

    const requestId = new ObjectId(`${req.params.id}`)

    const deleted = await client.db("incubator").collection("blogs").deleteOne({_id: requestId})

    if(deleted.deletedCount < 1){
        return res.sendStatus(404)
    }

    return res.sendStatus(204)
})


