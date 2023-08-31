import * as bcript from "bcrypt"


export const passwordService = {
    
    async hashPassword(password:string){
        
        const salt = await bcript.genSalt(10)

        return await bcript.hash(password, salt)

    }
}