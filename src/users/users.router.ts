import { Response, Router } from "express";
import { RequestWithBody, RequestWithParam, RequestWithQuery } from "../types/blogs.request.types";
import { client } from "../blogs/db/db.init";
import { usersRepository } from "./users.repository";
import * as bcript from "bcrypt"
import { body } from "express-validator";
import { validationResultMiddleware } from "../blogs/validation/blog.validatiom";
import { usersEmailValidation, usersLoginValidation, usersPasswordValidation } from "./users.validation";
import { ObjectId } from "mongodb";

export const usersRouter = Router({})

usersRouter.get('/', async (req:RequestWithQuery<{sortBy:string, sortDirection:string, pageNumber:number, pageSize: number, searchLoginTerm:string, searchEmailTerm:string}>, res:Response) =>{
    
    const searchLoginTerm = (req.query.searchLoginTerm) ? req.query.searchLoginTerm : ''

    const searchEmailTerm = (req.query.searchEmailTerm) ? req.query.searchEmailTerm : ''

    const sortBy = (req.query.sortBy) ? req.query.sortBy : "createdAt"

    const sortDirection = (req.query.sortDirection === "asc") ? 1 : -1
    
    const sotringQuery = usersRepository.usersSortingQuery(sortBy, sortDirection)

    const pageNumber = (req.query.pageNumber) ? +req.query.pageNumber : 1

    const pageSize = (req.query.pageSize) ? +req.query.pageSize : 10

    const itemsToSkip = (pageNumber - 1) * pageSize

    //
    //FIX FIMD METHOD
    //

    const usersToSend = await client.db("incubator").collection("users").find({ $or: [{login: {$regex: searchLoginTerm}},{email: {$regex: searchEmailTerm }}]},{projection:{_id:0, salt:0, password:0}})
        .sort(sotringQuery)
        .skip(itemsToSkip)
        .limit(pageSize)
        .toArray()

    const totalCountOfItems = await client.db("incubator").collection("users")
        .find({ $or: [{login: {$regex: searchLoginTerm}},{email: {$regex: searchEmailTerm }}]}).toArray()

    const mappedResponse = {
        pagesCount: Math.ceil(totalCountOfItems.length / pageSize),
        page: pageNumber,
        pageSize: pageSize,
        totalCount: totalCountOfItems.length,
        items: [...usersToSend]
    }
    res.status(200).send(mappedResponse)
})

usersRouter.post('/',
    usersLoginValidation(),
    usersEmailValidation(),
    usersPasswordValidation(),
    validationResultMiddleware,
    async (req:RequestWithBody<{login:string, password:string, email:string}>, res:Response) =>{

        const salt = await bcript.genSalt(10)

        const usersPassword = await bcript.hash(req.body.password, salt)

        const newUser = {
            createdAt: new Date().toISOString(),
            login:req.body.login,
            password: usersPassword,
            email: req.body.email,
            salt
        }

        const insertedUser = await client.db('incubator').collection('users').insertOne(newUser)
        await client.db('incubator').collection('users').updateOne({_id:insertedUser.insertedId}, {$set:{id: insertedUser.insertedId}})
        const userToReturn = await client.db('incubator').collection('users').find({_id: insertedUser.insertedId}, {projection:{_id:0, salt:0, password:0}}).toArray()
        res.status(201).send(userToReturn)
})

usersRouter.delete('/:id', async (req:RequestWithParam<{id:string}>, res:Response) =>{
    
    const userTodelete = await client.db('incubator').collection('users').deleteOne({_id: new ObjectId(req.params.id)})
    if(userTodelete.deletedCount < 1){
        return res.sendStatus(404)
    }
    return res.sendStatus(204)
})
