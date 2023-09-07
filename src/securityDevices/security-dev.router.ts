import { Request, Response, Router } from "express";
import { JwtPayload } from "jsonwebtoken";
import { jwtService } from "../app/jwt.service";
import { client } from "../blogs/db/db.init";
import { ObjectId } from "mongodb";



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