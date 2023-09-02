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

    createToken(user: UserType | jwt.JwtPayload, expireTime:string){

        return jwt.sign({userId:user.id, email:user.email, login:user.login}, SECRET_KEY,{expiresIn: expireTime})
    },

    getUserByToken(token: string): jwt.JwtPayload | null{
        token = token.replace('Bearer', '').trim()
        try{
            const verifiedToken = jwt.verify(token, SECRET_KEY) as jwt.JwtPayload

            if(verifiedToken){
                delete verifiedToken.exp
                delete verifiedToken.iat
                console.log(verifiedToken)
                return verifiedToken 
    
            } else{
                 return null
                }
        }
        catch(err){
            return null
        } 
    }

}