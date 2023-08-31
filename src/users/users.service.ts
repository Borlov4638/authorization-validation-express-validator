import { ObjectId } from "mongodb"
import { passwordService } from "../app/password.service"
import { client } from "../blogs/db/db.init"
import { usersRepository } from "./users.repository"
import uuid4 from 'uuid4'
import { add } from "date-fns"


export const usersService = {

    async getUsersWithPaganation(pageNumber: number, pageSize: number, searchEmailTerm:string, searchLoginTerm : string, sortBy: string , sortDirection: string|number){

        searchLoginTerm = (searchLoginTerm) ? searchLoginTerm : ''

        searchEmailTerm = (searchEmailTerm) ? searchEmailTerm : ''
    
        sortBy = (sortBy) ? sortBy : "createdAt"
    
        sortDirection = (sortDirection === "asc") ? 1 : -1
        
        const sotringQuery = usersRepository.usersSortingQuery(sortBy, sortDirection)
    
        pageNumber = (pageNumber) ? +pageNumber : 1
    
        pageSize = (pageSize) ? +pageSize : 10
    
        const itemsToSkip = (pageNumber - 1) * pageSize
    
        const usersToSend = await client.db("incubator").collection("users")
            .find({ $or: [{login: {$regex: searchLoginTerm, $options: 'i'}},{email: {$regex: searchEmailTerm, $options: 'i' }}]},{projection:{_id:0, password:0}})
            .sort(sotringQuery)
            .skip(itemsToSkip)
            .limit(pageSize)
            .toArray()
    
        const totalCountOfItems = await client.db("incubator").collection("users")
            .find({ $or: [{login: {$regex: searchLoginTerm, $options: 'i'}},{email: {$regex: searchEmailTerm, $options: 'i'}}]}).toArray()
    
        const mappedResponse = {
            pagesCount: Math.ceil(totalCountOfItems.length / pageSize),
            page: pageNumber,
            pageSize: pageSize,
            totalCount: totalCountOfItems.length,
            items: [...usersToSend]
        }

        return mappedResponse
    
    },

    async createNewUser(login:string, password:string, email:string, confirmed: boolean){
        
        const usersPassword = await passwordService.hashPassword(password)

        const newUser = {
            createdAt: new Date().toISOString(),
            login,
            password: usersPassword,
            email,
            emailConfirmation:{
                confirmationCode: uuid4(),
                expirationDate: add(new Date(), {minutes:30}),
                isConfirmed: confirmed
            }
        }

        const insertedUser = await client.db('incubator').collection('users').insertOne(newUser)
        await client.db('incubator').collection('users').updateOne({_id:insertedUser.insertedId}, {$set:{id: insertedUser.insertedId}})
        const userToReturn = await client.db('incubator').collection('users').findOne({_id: insertedUser.insertedId}, {projection:{_id:0, password:0, emailConfirmation:0}})
        
        if(confirmed){
            return userToReturn
        }
        else{
            return newUser.emailConfirmation.confirmationCode
        }
    },

    async deleteUser(userId:string){

        const userTodelete = await client.db('incubator').collection('users').deleteOne({_id: new ObjectId(userId)})

        if(userTodelete.deletedCount < 1){
            return false
        }
        else{
            return true
        }
    
    }
}