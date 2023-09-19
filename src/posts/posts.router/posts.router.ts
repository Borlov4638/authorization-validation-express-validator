import { Request, Response, Router } from "express";
import { RequestWithBody, RequestWithParam, RequestWithParamAndBody, RequestWithParamAndQuery, RequestWithQuery } from "../../types/blogs.request.types";
import {  postBlogIdValidation, postContenteValidation, postIsExistsById, postShortDescriptionValidation, postTitleValidation } from "../valodation/posts.validartion";
import { authValidationMiddleware, bearerAuthorization } from "../../auth/auth.middleware";
import { client } from "../../blogs/db/db.init";
import { validationResultMiddleware } from "../../blogs/validation/blog.validatiom";
import { ObjectId } from "mongodb";
import { blogsRepository } from "../../blogs/repository/blogs.repository";
import { jwtService, jwtUser } from "../../app/jwt.service";
import { postsRepository } from "../posts.repository";
import { commentsContentValidation } from "../../comments/comments.validation";
import { LikeStatus } from "../../app/like-status.enum";
import { commentsRepository } from "../../comments/comments.repo";
import { CommentType } from "../../types/comments.type";
import { postsService } from "../posts.service";
import { PostType } from "../../types/posts.types";


export const postRouter = Router({})

postRouter.get('/', async (req :RequestWithQuery<{sortBy:string, sortDirection:string, pageNumber:number, pageSize:number}>, res :Response) =>{

    const sortBy = (req.query.sortBy) ? req.query.sortBy : "createdAt"

    const sortDirection = (req.query.sortDirection === "asc") ? 1 : -1
    
    const sotringQuery = blogsRepository.postsSortingQuery(sortBy, sortDirection)

    const pageNumber = (req.query.pageNumber) ? +req.query.pageNumber : 1

    const pageSize = (req.query.pageSize) ? +req.query.pageSize : 10

    const itemsToSkip = (pageNumber - 1) * pageSize

    const findedPosts = await client.db("incubator").collection("posts").find({},{projection:{_id:0}})
        .sort(sotringQuery)
        .skip(itemsToSkip)
        .limit(pageSize)
        .toArray() as PostType[]

    const postsToSend = findedPosts.map(blog => {
        const likesCount = blog.extendedLikesInfo.usersWhoLiked.length
        const dislikesCount = blog.extendedLikesInfo.usersWhoDisliked.length
        const newestLikes = blog.extendedLikesInfo.usersWhoLiked.slice(0, 2) 
        let myStatus = LikeStatus.None

        if(req.headers.authorization){
            const user = jwtService.getAllTokenData(req.headers.authorization)
            if(user){
                myStatus = postsRepository.getLikeStatus(blog, user as jwtUser)
            }
        }
    
        return {...blog, extendedLikesInfo:{
            likesCount,
            dislikesCount,
            myStatus,
            newestLikes
        }}
    
    })

    const totalCountOfItems = await client.db("incubator").collection("posts")
        .find({}).toArray()

    const mappedResponse = {
        pagesCount: Math.ceil(totalCountOfItems.length / pageSize),
        page: pageNumber,
        pageSize: pageSize,
        totalCount: totalCountOfItems.length,
        items: [...postsToSend]
    }
    res.status(200).send(mappedResponse)
})

postRouter.get('/:id', async (req : RequestWithParam<{id:string}>, res: Response) =>{

    const foundedPost = await client.db("incubator").collection("posts").findOne({_id: new ObjectId(`${req.params.id}`)}, {projection:{_id:0}}) as PostType

    if(!foundedPost){
        return res.sendStatus(404)
    }
    let myStatus = LikeStatus.None

    if(req.headers.authorization){
        const user = jwtService.getAllTokenData(req.headers.authorization)
        if(user){
            myStatus = postsRepository.getLikeStatus(foundedPost, user as jwtUser)
        }
    }
    const likesCount = foundedPost.extendedLikesInfo.usersWhoLiked.length
    const dislikesCount = foundedPost.extendedLikesInfo.usersWhoDisliked.length
    const newestLikes = foundedPost.extendedLikesInfo.usersWhoLiked.slice(0, 2) 
    const postToShow = {...foundedPost, extendedLikesInfo:{
        likesCount,
        dislikesCount,
        myStatus,
        newestLikes
    }}
    return res.status(200).send(postToShow)
})

postRouter.post('/',
    authValidationMiddleware,
    postTitleValidation(),
    postShortDescriptionValidation(),
    postContenteValidation(),
    postBlogIdValidation(),
    validationResultMiddleware,

    async (req:RequestWithBody<{title:string, shortDescription:string, content:string, blogId:string}>, res :Response) =>{
    
    const blogToFetch  = await client.db("incubator").collection("blogs").findOne({_id: new ObjectId(req.body.blogId)})

    if(!blogToFetch){
        return res.status(400).send({errorsMessages:[{message: 'no such blog', field:'blogId'}]})
    }

    const newPost = {
        title: req.body.title,
        shortDescription: req.body.shortDescription,
        content: req.body.content,
        blogId: blogToFetch.id,
        blogName: blogToFetch.name,
        createdAt: (new Date()).toISOString(),
        extendedLikesInfo:{
            usersWhoLiked:[],
            usersWhoDisliked:[]
        }
    }
    

    const insertedPost = await client.db("incubator").collection("posts").insertOne(newPost)
    await client.db("incubator").collection("posts").updateOne({_id:insertedPost.insertedId}, {$set:{id:insertedPost.insertedId}})
    const postToShow = await client.db("incubator").collection("posts").findOne({_id: insertedPost.insertedId}, {projection:{_id:0, extendedLikesInfo:0}})
    return res.status(201).send({...postToShow, extendedLikesInfo:{
        likesCount:0,
        dislikesCount:0,
        myStatus:LikeStatus.None,
        newestLikes:[]
    }})
})

postRouter.put('/:id',
    authValidationMiddleware,
    postIsExistsById,
    postTitleValidation(),
    postShortDescriptionValidation(),
    postContenteValidation(),
    postBlogIdValidation(),
    validationResultMiddleware,

    async (req:RequestWithParamAndBody<{id:string},{title:string, shortDescription:string, content:string, blogId:string}>, res :Response) =>{
    
    const blogToFetch = await client.db("incubator").collection("blogs").findOne({_id: new ObjectId(req.body.blogId)})

    if(!blogToFetch){
        return res.status(400).send({errorsMessages:[{message: 'no such blog', field:'blogId'}]})
    }
    
    await client.db("incubator").collection("posts")
        .updateOne({_id: new ObjectId(req.params.id)}, {$set:
            {title:req.body.title,
            shortDescription:req.body.shortDescription,
            content: req.body.content,
            blogId: blogToFetch.id,
            blogName: blogToFetch.name}})

    return res.sendStatus(204)

})

postRouter.delete('/:id',
    authValidationMiddleware,
    postIsExistsById,
    async (req:Request, res:Response) =>{

    const deleted = await client.db("incubator").collection("posts").deleteOne({_id: new ObjectId(req.params.id)})
    
    if(deleted.deletedCount < 1){
        return res.sendStatus(404)
    }

    return res.sendStatus(204)
})

postRouter.post('/:postId/comments',
    bearerAuthorization,
    commentsContentValidation(),
    validationResultMiddleware,
    async (req:RequestWithParamAndBody<{postId:string},{content: string}>, res:Response) =>{

        const postToComment = await client.db('incubator').collection('posts').findOne({_id:new ObjectId(req.params.postId)})

        if(!postToComment){
            return res.sendStatus(404)
        }

        if(!req.headers.authorization){
            return res.sendStatus(401)
        }

        const userInfo = jwtService.getUserByToken(req.headers.authorization) as jwtUser

        if(!userInfo){
            return res.sendStatus(401)
        }
        
        const newComment = {
            content: req.body.content,
            commentatorInfo:{
                userId: userInfo.userId,
                userLogin: userInfo.login
            },
            createdAt: new Date().toISOString(),
            postId:postToComment._id,
            likesInfo:{
                usersWhoLiked:[],
                usersWhoDisliked: []
            }
        }

        const insertedComment = await client.db('incubator').collection('comments').insertOne(newComment)
        await client.db('incubator').collection('comments').updateOne({_id: insertedComment.insertedId}, {$set:{id: insertedComment.insertedId}})
        const commentToShow = await client.db('incubator').collection('comments').findOne({_id:insertedComment.insertedId}, {projection:{_id:0, postId:0, likesInfo:0}})
        commentToShow!.likesInfo = {
            dislikesCount: 0,
            likesCount:0,
            myStatus: LikeStatus.None
        }
        return res.status(201).send(commentToShow)

})

postRouter.get('/:postId/comments',
    async (req:RequestWithParamAndQuery<{postId:string},{pageNumber:number, sortBy:string, sortDirection:string, pageSize:number}>, res:Response) =>{

    
    const postToComment = await client.db("incubator").collection("posts").findOne({_id: new ObjectId(req.params.postId)})

    if(!postToComment){
        return res.sendStatus(404)
    }

    const sortBy = (req.query.sortBy) ? req.query.sortBy : "createdAt"

    const sortDirection = (req.query.sortDirection === "asc") ? 1 : -1
    
    const sotringQuery = postsRepository.commentsSortingQuery(sortBy, sortDirection)

    const pageNumber = (req.query.pageNumber) ? +req.query.pageNumber : 1

    const pageSize = (req.query.pageSize) ? +req.query.pageSize : 10

    const itemsToSkip = (pageNumber - 1) * pageSize

    const selectedComments = await client.db("incubator").collection("comments").find({postId:postToComment._id},{projection:{_id:0, postId:0}})
        .sort(sotringQuery)
        .skip(itemsToSkip)
        .limit(pageSize)
        .toArray() as CommentType[]
        
    const token = req.headers.authorization
    const commentsToSend = selectedComments.map(comm => {
        let myStatus = LikeStatus.None
        if(token){
            const user = jwtService.getAllTokenData(token) as jwtUser
            if(user){
                myStatus = commentsRepository.getLikeStatus(comm, user)
            }
        }
        const likesCount = comm.likesInfo.usersWhoLiked.length
        const dislikesCount = comm.likesInfo.usersWhoDisliked.length
        return {...comm, likesInfo:{likesCount, dislikesCount, myStatus}}

    })

    const totalCountOfItems = await client.db("incubator").collection("comments")
        .find({postId:postToComment._id}).toArray()

    const mappedResponse = {
        pagesCount: Math.ceil(totalCountOfItems.length / pageSize),
        page: pageNumber,
        pageSize: pageSize,
        totalCount: totalCountOfItems.length,
        items: [...commentsToSend]
    }
    return res.status(200).send(mappedResponse)
})

postRouter.post('/:postId/like-status', async (req:RequestWithParamAndBody<{postId:string}, {likeStatus:LikeStatus}>, res:Response) =>{
    
    if(!req.headers.authorization){
        return res.sendStatus(401)
    }

    const user = jwtService.getAllTokenData(req.headers.authorization) as jwtUser

    if(!user){
        return res.sendStatus(401)
    }

    const postToLike = await postsService.getPostById(req.params.postId)

    if(!postToLike){
        return res.sendStatus(404)
    }

    const likeStatuses = Object.values(LikeStatus)

    if(!likeStatuses.includes(req.body.likeStatus)){
        return res.status(400).send({errorsMessages:[
            {
                message:"invalid like status",
                field:"likeStatus"
            }
        ]})
    }

    const isLikeSet = await postsService.changeLikeStatus(postToLike as PostType, user, req.body.likeStatus)

    if(isLikeSet){
        return res.sendStatus(204)
    }else{
        return res.sendStatus(500)
    }
})