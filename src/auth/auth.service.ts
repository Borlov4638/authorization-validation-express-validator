import { client } from "../blogs/db/db.init"
import * as bcrypt from "bcrypt"
import { UserType } from "../types/users.type"
import * as nodemailer from 'nodemailer'
import { add, compareAsc, format } from "date-fns"
import uuid4 from "uuid4"
import { ObjectId, WithId } from "mongodb"
import { JwtPayload } from "jsonwebtoken"
import { jwtService } from "../app/jwt.service"


export const authService = {
    async checkCredentials(loginOrEmail:string, password:string) : Promise<UserType | false>{
        
        const userNameOrEmail = await client.db('incubator').collection('users').findOne({$or:[{login: loginOrEmail}, {email: loginOrEmail}]})

        if (userNameOrEmail){
            
            return await (bcrypt.compare(password, userNameOrEmail.password)) ? userNameOrEmail as unknown as UserType : false

        }else{
                return false
            }
    },

    async sendMail(email:string, confirmationCode:string){

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: "borisincubator@gmail.com",
                pass: "fczspwlifurculqv",
            },
        });

        const info = await transporter.sendMail({
            from: 'Boris <borisincubator@gmail.com>', // sender address
            to: email, // list of receivers
            subject: "Registration conformation ✔", // Subject line
            html: `<p>To finish registration please follow the link below:<a href='https://somesite.com/confirm-email?code=${confirmationCode}'>complete registration</a></p>`, // html body
        });
        console.log(info)
    },

    async verifyUserByCode(code:string){
        
        const userToVerify = await client.db('incubator').collection('users').findOne({"emailConfirmation.confirmationCode": code})

        if(userToVerify && userToVerify.emailConfirmation.confirmationCode == code && compareAsc(userToVerify.emailConfirmation.expirationDate, new Date())&& userToVerify.emailConfirmation.isConfirmed === false){

            await client.db('incubator').collection('users').updateOne(userToVerify, {$set:{'emailConfirmation.isConfirmed': true}})

            return true
        }
        else{
            return false
        }
    },

    async resendEmailForRegistration(email:string){

        const userToVerify = await client.db('incubator').collection('users').findOne({email})

        if(userToVerify && userToVerify.emailConfirmation.isConfirmed === false){

            const newConfirmationCode = uuid4()
            await client.db('incubator').collection('users').updateOne(userToVerify, {$set:{"emailConfirmation.confirmationCode": newConfirmationCode}})

            await this.sendMail(email, newConfirmationCode)
            return true
        }
        else{
            return false
        }
    },

    async sendPasswordRecoweryEmail(email:string){
        const userToVerify = await client.db('incubator').collection('users').findOne({email})

        if(!userToVerify){
            return true
        }
        const code = jwtService.createPasswordRecoweryToken(userToVerify, 3600)

        await this.sendMail(email, code)
        return true
    },

    async createNewSession(userId:ObjectId, ip:string, title:string, deviceId:string, expDate: number): Promise<void>{

        const refreshTokenExpirationDate = add(new Date(), {seconds:expDate}).toISOString()

        const lastActiveDate = Math.floor(+new Date()/1000) * 1000

        console.log(new Date(lastActiveDate).toISOString())
        await client.db('incubator').collection('deviceSessions').insertOne({userId, ip, title, lastActiveDate: new Date(lastActiveDate).toISOString(), deviceId, expiration:refreshTokenExpirationDate})

    },

    async isSessionValid(token: JwtPayload){
        console.log(new Date(token.iat! * 1000).toISOString())
        return await client.db('incubator').collection('deviceSessions').findOne({userId:new ObjectId(token.userId), lastActiveDate:new Date(token.iat! * 1000).toISOString()})
    }


}