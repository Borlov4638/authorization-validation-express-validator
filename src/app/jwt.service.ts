import { WithId } from "mongodb"
import { UserType } from "../types/users.type"
import * as jwt from 'jsonwebtoken'

const SECRET_KEY = 'myverysecretkey'

export const jwtService = {

    createToken(user: UserType){

        return jwt.sign({userId:user.id, email:user.email, login:user.login}, SECRET_KEY,{expiresIn: '1h'})
    },

    getUserByToken(token: string): jwt.JwtPayload | null{
        token = token.replace('Bearer', '').trim()
        try{
            return jwt.verify(token, SECRET_KEY) as jwt.JwtPayload
        }
        catch(err){
            return null
        } 
    }

}