import { client } from "../blogs/db/db.init"
import * as bcrypt from "bcrypt"
import { UserType } from "../types/users.type"



export const authService = {
    async checkCredentials(loginOrEmail:string, password:string) : Promise<UserType | false>{
        
        const userNameOrEmail = await client.db('incubator').collection('users').findOne({$or:[{login: loginOrEmail}, {email: loginOrEmail}]})

        if (userNameOrEmail){
            
            return await (bcrypt.compare(password, userNameOrEmail.password)) ? userNameOrEmail as unknown as UserType : false

        }else{
                return false
            }
    }
}