import { NextFunction, Request, Response } from "express"
import { client } from "../blogs/db/db.init"
import { sub } from "date-fns"


export const customRateLimit = (async (req:Request, res:Response, next:NextFunction) =>{

    const requestIp = req.headers['x-forwarded-for'] as string || req.socket.remoteAddress! 

    await client.db('incubator').collection('apiRequests').insertOne({IP: requestIp, URL:req.originalUrl, date: new Date()})
    
    const reqCount = await client.db('incubator').collection('apiRequests').find({date:{$gte: sub(new Date(), {seconds:10})}}).toArray()

    const loginCount = reqCount.filter(req => req.URL === "/auth/login")

    const registrationConfirmationCount = reqCount.filter(req => req.URL === "/auth/registration-confirmation")

    const registrationCount = reqCount.filter(req => req.URL === "/auth/registration")

    const registrationEmailResCount = reqCount.filter(req => req.URL === "/auth/registration-email-resending")

    const newPasswordCount = reqCount.filter(req => req.URL === "/auth/new-password")

    const passwordRecoweryCount = reqCount.filter(req => req.URL === "/auth/password-recovery")

    if(loginCount.length > 5 || registrationConfirmationCount.length > 5|| registrationCount.length > 5 || registrationEmailResCount.length > 5|| newPasswordCount.length >5 || passwordRecoweryCount.length > 5){
        return res.sendStatus(429)
    }

    console.log(reqCount.length)
    return next()
})