import { Request, Response, Router } from "express";
import { JwtPayload } from "jsonwebtoken";
import { jwtService } from "../app/jwt.service";
import { client } from "../blogs/db/db.init";
import { ObjectId } from "mongodb";
import { RequestWithParam } from "../types/blogs.request.types";



export const secDevRouter = Router({})


secDevRouter.get('/devices', async (req:Request, res:Response) =>{
    
    if(!req.cookies.refreshToken){
        return res.sendStatus(401)
    }

    const token : JwtPayload | null = jwtService.getAllTokenData(req.cookies.refreshToken)

    if(!token){
        return res.sendStatus(401)
    }

    const usersSessions = await client.db('incubator').collection('deviceSessions').find({userId:new ObjectId(token.userId)}, {projection:{_id:0, userId:0, expiration:0}}).toArray()

    return res.status(200).send(usersSessions)
})

secDevRouter.delete('/devices', async (req:Request, res:Response) =>{
    
    if(!req.cookies.refreshToken){
        return res.sendStatus(401)
    }

    const token : JwtPayload | null = jwtService.getAllTokenData(req.cookies.refreshToken)

    if(!token){
        return res.sendStatus(401)
    }

    await client.db('incubator').collection('deviceSessions').deleteMany({userId:new ObjectId(token.userId), deviceId:{$not: {$regex:token.deviceId}}})

    return res.sendStatus(204)
})

secDevRouter.delete('/devices/:deviceId', async (req:RequestWithParam<{deviceId:string}>, res:Response) =>{

    if(!req.cookies.refreshToken){
        return res.sendStatus(401)
    }

    const token : JwtPayload | null = jwtService.getAllTokenData(req.cookies.refreshToken)

    if(!token){
        return res.sendStatus(401)
    }

    const deviceToDelete = await client.db('incubator').collection('deviceSessions').findOne({deviceId: req.params.deviceId})

    if(!deviceToDelete){
        return res.sendStatus(404)
    }

    if(deviceToDelete.userId.toString() !== token.userId){
        return res.sendStatus(403)
    }
    
    await client.db('incubator').collection('deviceSessions').deleteOne(deviceToDelete)
    
    return res.sendStatus(204)
})