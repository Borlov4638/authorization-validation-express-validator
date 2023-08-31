import { client } from "../blogs/db/db.init"
import * as bcrypt from "bcrypt"
import { UserType } from "../types/users.type"
import * as nodemailer from 'nodemailer'


export const authService = {
    async checkCredentials(loginOrEmail:string, password:string) : Promise<UserType | false>{
        
        const userNameOrEmail = await client.db('incubator').collection('users').findOne({$or:[{login: loginOrEmail}, {email: loginOrEmail}]})

        if (userNameOrEmail){
            
            return await (bcrypt.compare(password, userNameOrEmail.password)) ? userNameOrEmail as unknown as UserType : false

        }else{
                return false
            }
    },

    async sendMail(email:string, subject:string, message:string){

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: "borisincubator@gmail.com",
                pass: "fczspwlifurculqv",
            },
        });
        //console.log('here')

        const info = await transporter.sendMail({
            from: 'Boris <borisincubator@gmail.com>', // sender address
            to: email, // list of receivers
            subject: subject, // Subject line
            html: message, // html body
        });
        console.log(info)
    }
}