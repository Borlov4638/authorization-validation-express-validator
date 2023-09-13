import { UserType } from "../types/users.type"
import * as jwt from 'jsonwebtoken'

const SECRET_KEY = 'myverysecretkey'

export interface jwtUser{
    
    userId:string,
    login:string,
    email:string,
    exp:number,
    iat:number
}

export const jwtService = {

    createAccessToken(user: UserType | jwt.JwtPayload, expireTime:number){

        const expiresIn = expireTime.toString() + 's'

        return jwt.sign({userId:user.id, email:user.email, login:user.login}, SECRET_KEY,{expiresIn})
    },

    createRefreshToken(user: UserType | jwt.JwtPayload, deviceId:string, expireTime:number){

        const expiresIn = expireTime.toString() + 's'

        return jwt.sign({userId:user.id, email:user.email, login:user.login, deviceId}, SECRET_KEY,{expiresIn})
    },

    getUserByToken(token: string): jwt.JwtPayload | null{
        token = token.replace('Bearer', '').trim()
        try{
            const verifiedToken = jwt.verify(token, SECRET_KEY) as jwt.JwtPayload

            if(verifiedToken){
                delete verifiedToken.exp
                delete verifiedToken.iat
                return verifiedToken 
    
            } else{
                 return null
                }
        }
        catch(err){
            return null
        } 
    },

    getAllTokenData(token: string): jwt.JwtPayload | null{
        token = token.replace('Bearer', '').trim()
        try{
            const verifiedToken = jwt.verify(token, SECRET_KEY) as jwt.JwtPayload

            if(verifiedToken){
                return verifiedToken 
    
            } else{
                 return null
                }
        }
        catch(err){
            return null
        } 
    },

    createPasswordRecoweryToken(user: UserType | jwt.JwtPayload, expireTime:number){

        const expiresIn = expireTime.toString() + 's'

        return jwt.sign({userId:user.id, email:user.email, login:user.login}, SECRET_KEY,{expiresIn})
    }

}