import { Request, Response, Router } from "express";
import { RequestWithParam, RequestWithParamAndBody } from "../types/blogs.request.types";
import { commentsContentValidation } from "./comments.validation";
import { jwtService, jwtUser } from "../app/jwt.service";
import { validationResultMiddleware } from "../blogs/validation/blog.validatiom";
import { client } from "../blogs/db/db.init";
import { ObjectId } from "mongodb";


export const commentsRouter = Router({})

commentsRouter.put('/:commentId',
    commentsContentValidation(),
    validationResultMiddleware,
    async (req:RequestWithParamAndBody<{commentId:string}, {content:string}>, res:Response) =>{
        
        if(!req.headers.authorization){
            return res.sendStatus(401)
        }

        const isAuthorized = jwtService.getUserByToken(req.headers.authorization) as jwtUser

        if(!isAuthorized){
            return res.sendStatus(401)
        }

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
        
        const commentToShow = await client.db('incubator').collection('comments').findOne({_id: new ObjectId(req.params.commentId)}, {projection:{_id:0, postId:0}})

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