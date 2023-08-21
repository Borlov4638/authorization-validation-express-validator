import { Request, Response, Router } from "express";
import { RequestWithBody, RequestWithParam, RequestWithParamAndBody } from "../../types/blogs.request.types";
import { validationResult } from "express-validator";
import {  postBlogIdValidation, postContenteValidation, postShortDescriptionValidation, postTitleValidation } from "../valodation/posts.validartion";
import { authValidationMiddleware } from "../../auth/auth.middleware";
import { client } from "../../blogs/db/db.init";

export const postRouter = Router({})

postRouter.get('/', async (req :Request, res :Response) =>{
    const postsToReturn = await client.db("incubator").collection("posts").find({}, {projection:{_id:0}}).toArray()
    res.status(200).send(postsToReturn)
})

postRouter.get('/:id', async (req : RequestWithParam<{id:string}>, res: Response) =>{
    const foundedPost = await client.db("incubator").collection("posts").findOne({id: req.params.id}, {projection:{_id:0}})

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

    async (req:RequestWithBody<{title:string, shortDescription:string, content:string, blogId:string}>, res :Response) =>{
    
    const result = validationResult(req)
    
    const unathorised = result.array().find(error => error.msg === '401')

    if(unathorised){
        return res.sendStatus(401)
    }

    if(!result.isEmpty()){
        console.log("123123")
        return res.status(400).send({errorsMessages:result.array({onlyFirstError:true}).map(error => error.msg)})
    }
    
    const blogToFetch  = await client.db("incubator").collection("blogs").findOne({id: req.body.blogId})

    if(!blogToFetch){
        return res.status(400).send({errorsMessages:[{message: 'no such blog', field:'blogId'}]})
    }

    const newPost = {
        id: (+new Date()).toString(),
        title: req.body.title,
        shortDescription: req.body.shortDescription,
        content: req.body.content,
        blogId: blogToFetch.id,
        blogName: blogToFetch.name,
        createdAt: (new Date()).toISOString()
    }
    res.status(201).send(newPost)

    return await client.db("incubator").collection("posts").insertOne(newPost)
})

postRouter.put('/:id',
    authValidationMiddleware(),
    postTitleValidation(),
    postShortDescriptionValidation(),
    postContenteValidation(),
    postBlogIdValidation(),
    async (req:RequestWithParamAndBody<{id:string},{title:string, shortDescription:string, content:string, blogId:string}>, res :Response) =>{
    
    const result = validationResult(req)

    const unathorised = result.array().find(error => error.msg === '401')

    if(unathorised){
        return res.sendStatus(401)
    }

    if(!result.isEmpty()){
        return res.status(400).send({errorsMessages:result.array({onlyFirstError:true}).map(error => error.msg)})
    }

    const postToUpdate = await client.db("incubator").collection("posts").findOne({id:req.params.id})

    if(!postToUpdate){
        return res.status(404).send("post is not found")
    }

    const blogToFetch = await client.db("incubator").collection("blogs").findOne({id: req.body.blogId})

    if(!blogToFetch){
        return res.status(400).send({errorsMessages:[{message: 'no such blog', field:'blogId'}]})
    }
    
    await client.db("incubator").collection("posts")
        .updateOne({id: req.params.id}, {$set:
            {title:req.body.title,
            shortDescription:req.body.shortDescription,
            content: req.body.content,
            blogId: blogToFetch.id,
            blogName: blogToFetch.name}})

    return res.sendStatus(204)

})

postRouter.delete('/:id',
    authValidationMiddleware(),
    async (req:Request, res:Response) =>{

    const result = validationResult(req)

    const unathorised = result.array().find(error => error.msg === '401')

    if(unathorised){
        return res.sendStatus(401)
    }

    const postToDelete = await client.db("incubator").collection("posts").findOne({id:req.params.id})

    if(!postToDelete){
        return res.sendStatus(404)
    }
    client.db("incubator").collection("posts").findOneAndDelete({id:req.params.id})

    return res.sendStatus(204)
})