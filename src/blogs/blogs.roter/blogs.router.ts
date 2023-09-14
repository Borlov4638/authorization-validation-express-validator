import { Request, Response, Router } from "express";
import { RequestWithBody, RequestWithParam, RequestWithParamAndBody, RequestWithParamAndQuery, RequestWithQuery } from "../../types/blogs.request.types";
import { blogDescriptionValidation, blogNameValidation, blogUrlMatchingValidation, blogUrlValidation, validationResultMiddleware } from "../validation/blog.validatiom";
import { authValidationMiddleware } from "../../auth/auth.middleware";
import { client } from "../db/db.init";
import { ObjectId } from "mongodb";
import { blogsRepository } from "../repository/blogs.repository";
import { postContenteValidation, postShortDescriptionValidation, postTitleValidation } from "../../posts/valodation/posts.validartion";
import { BlogsModel, blogsDbRepo } from "../db/blogs.db";
import { BlogType } from "../../types/blogs.type";

export const blogsRouter : Router = Router({})

blogsRouter.get('/', async (req:RequestWithQuery<{searchNameTerm:string, sortBy:string, sortDirection:string, pageNumber:number, pageSize:number}>, res: Response) => {

    const searchNameTerm = (req.query.searchNameTerm) ? req.query.searchNameTerm : ''

    const sortBy = (req.query.sortBy) ? req.query.sortBy : "createdAt"

    const sortDirection = (req.query.sortDirection === "asc") ? 1 : -1
    
    const sotringQuery = blogsRepository.blogsSortingQuery(sortBy, sortDirection)

    const pageNumber = (req.query.pageNumber) ? +req.query.pageNumber : 1

    const pageSize = (req.query.pageSize) ? +req.query.pageSize : 10

    const itemsToSkip = (pageNumber - 1) * pageSize

    const blogsToSend = await client.db("incubator").collection("blogs").find({ name: {$regex: searchNameTerm, $options:'i'}},{projection:{_id:0}})
        .sort(sotringQuery)
        .skip(itemsToSkip)
        .limit(pageSize)
        .toArray()

    const totalCountOfItems = await client.db("incubator").collection("blogs")
        .find({ name: {$regex: searchNameTerm, $options:'i'}}).toArray()

    const mappedResponse = {
        pagesCount: Math.ceil(totalCountOfItems.length / pageSize),
        page: pageNumber,
        pageSize: pageSize,
        totalCount: totalCountOfItems.length,
        items: [...blogsToSend]
    }
    res.status(200).send(mappedResponse)
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
        
        const BlogId = new ObjectId() 

        const newBlog = (
        {
            _id: BlogId,
            id: BlogId,
            name: req.body.name,
            description: req.body.description,
            websiteUrl: req.body.websiteUrl,
            createdAt: (new Date()).toISOString(),
            isMembership: false
        })

        const createdBlog = blogsDbRepo.createNewBlog(newBlog)

        if(!createdBlog) return res.sendStatus(500)
        
        return res.status(201).send(createdBlog)
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
        const findBlogToUpdate = await client.db("incubator").collection("blogs").find({_id: requestId}).toArray()


        if(findBlogToUpdate.length < 1){
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


blogsRouter.get('/:blogId/posts', async (req:RequestWithParamAndQuery<{blogId:string}, {pageNumber:number, pageSize:number, sortBy:string, sortDirection:string}>, res:Response) =>{
    const blogToInsert = await client.db("incubator").collection("blogs").findOne({_id: new ObjectId(req.params.blogId)})

    if(!blogToInsert){
        return res.sendStatus(404)
    }

    const sortBy = (req.query.sortBy) ? req.query.sortBy : "createdAt"

    const sortDirection = (req.query.sortDirection === "asc") ? 1 : -1
    
    const sotringQuery = blogsRepository.postsSortingQuery(sortBy, sortDirection)

    const pageNumber = (req.query.pageNumber) ? +req.query.pageNumber : 1

    const pageSize = (req.query.pageSize) ? +req.query.pageSize : 10

    const itemsToSkip = (pageNumber - 1) * pageSize

    const blogsToSend = await client.db("incubator").collection("posts").find({blogId:blogToInsert._id},{projection:{_id:0}})
        .sort(sotringQuery)
        .skip(itemsToSkip)
        .limit(pageSize)
        .toArray()

    const totalCountOfItems = await client.db("incubator").collection("posts")
        .find({blogId:blogToInsert._id}).toArray()

    const mappedResponse = {
        pagesCount: Math.ceil(totalCountOfItems.length / pageSize),
        page: pageNumber,
        pageSize: pageSize,
        totalCount: totalCountOfItems.length,
        items: [...blogsToSend]
    }
    return res.status(200).send(mappedResponse)

})

blogsRouter.post('/:blogId/posts',
    authValidationMiddleware,
    postTitleValidation(),
    postShortDescriptionValidation(),
    postContenteValidation(),
    validationResultMiddleware,
    async (req:RequestWithParamAndBody<{blogId:string},{title:string, shortDescription:string, content: string}>, res:Response) =>{
    
    const blogToInsert = await client.db("incubator").collection("blogs").findOne({_id: new ObjectId(req.params.blogId)})

    if(!blogToInsert){
        return res.sendStatus(404)
    }

    const newPost = {
        title: req.body.title,
        shortDescription: req.body.shortDescription,
        content: req.body.content,
        blogId: blogToInsert.id,
        blogName: blogToInsert.name,
        createdAt: (new Date()).toISOString()
    }
    

    const insertedPost = await client.db("incubator").collection("posts").insertOne(newPost)
    await client.db("incubator").collection("posts").updateOne({_id:insertedPost.insertedId}, {$set:{id:insertedPost.insertedId}})
    const postToShow = await client.db("incubator").collection("posts").findOne({_id: insertedPost.insertedId}, {projection:{_id:0}})
    return res.status(201).send(postToShow)

})