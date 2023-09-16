import { Response, Router } from "express";
import { RequestWithParam, RequestWithParamAndBody } from "../types/blogs.request.types";
import { commentsContentValidation } from "./comments.validation";
import { jwtService, jwtUser } from "../app/jwt.service";
import { validationResultMiddleware } from "../blogs/validation/blog.validatiom";
import { client } from "../blogs/db/db.init";
import { ObjectId } from "mongodb";
import { bearerAuthorization } from "../auth/auth.middleware";
import { LikeStatus } from "../app/like-status.enum";
import { commentService } from "./comments.service";
import { UserType } from "../types/users.type";
import { CommentType } from "../types/comments.type";


export const commentsRouter = Router({})

commentsRouter.put('/:commentId',
    bearerAuthorization,
    commentsContentValidation(),
    validationResultMiddleware,
    async (req:RequestWithParamAndBody<{commentId:string}, {content:string}>, res:Response) =>{
        
        const isAuthorized = jwtService.getUserByToken(req.headers.authorization!) as jwtUser

        const commentToUpdate = await client.db('incubator').collection('comments').findOne({_id: new ObjectId(req.params.commentId)})

        if(!commentToUpdate){
            return res.sendStatus(404)
        }

        if(isAuthorized.userId !== commentToUpdate.commentatorInfo.userId){
            return res.sendStatus(403)
        }

        await client.db('incubator').collection('comments').updateOne(commentToUpdate, {$set:{content:req.body.content}})
        return res.sendStatus(204)


})

commentsRouter.get('/:commentId',
    async (req:RequestWithParam<{commentId:string}>, res:Response) =>{
        
        const commentToShow = await commentService.getCommentById(req.params.commentId, req.headers.authorization) 

        if(!commentToShow){
            return res.sendStatus(404)
        }
        
        return res.status(200).send(commentToShow)
})



commentsRouter.delete('/:commentId',
    async (req:RequestWithParam<{commentId:string}>, res:Response) =>{
        
        if(!req.headers.authorization){
            return res.sendStatus(401)
        }

        const isAuthorized = jwtService.getUserByToken(req.headers.authorization) as jwtUser

        if(!isAuthorized){
            return res.sendStatus(401)
        }

        const commentToDelete = await client.db('incubator').collection('comments').findOne({_id: new ObjectId(req.params.commentId)})

        if(!commentToDelete){
            return res.sendStatus(404)
        }

        if(isAuthorized.userId !== commentToDelete.commentatorInfo.userId){
            return res.sendStatus(403)
        }

        await client.db('incubator').collection('comments').deleteOne(commentToDelete)
        return res.sendStatus(204)
})

commentsRouter.put('/:commentId/like-status', async (req:RequestWithParamAndBody<{commentId:string}, {likeStatus: LikeStatus}>, res:Response) =>{

    if(!req.headers.authorization){
        return res.sendStatus(401)
    }
    const user = jwtService.getAllTokenData(req.headers.authorization)

    if(!user){
        return  res.sendStatus(401);
    }

    const commentToLike = await client.db('incubator').collection('comments').findOne({_id: new ObjectId(req.params.commentId)})

    if(!commentToLike){
        return res.sendStatus(404)
    }
    
    //TODO Добавить проверку того что лайк статус в запросе есть в энуме

    console.log(commentService.changeLikeStatus(user as jwtUser, commentToLike as CommentType, req.body.likeStatus))

    const updatedLikeCount = commentService.changeLikeStatus(user as jwtUser, commentToLike as CommentType, req.body.likeStatus)

    await client.db("incubator").collection("comments").updateOne({_id: commentToLike._id}, {$set:{likesInfo:updatedLikeCount.likesInfo}})

    return res.sendStatus(204)
})
