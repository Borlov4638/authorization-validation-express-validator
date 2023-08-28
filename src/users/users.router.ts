import { Response, Router } from "express";
import { RequestWithBody, RequestWithQuery } from "../types/blogs.request.types";
import { client } from "../blogs/db/db.init";
import { usersRepository } from "./users.repository";
import * as bcript from "bcrypt"
import { body } from "express-validator";
import { validationResultMiddleware } from "../blogs/validation/blog.validatiom";

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
    body('login').exists().withMessage({message:"login is not passed", field:"login"}).isString().isLength({min:3, max:10}).matches(/^[a-zA-Z0-9_-]*$/).withMessage({message:"invalid login", field:"login"}),
    body('password').exists().withMessage({message:"password is not passed", field:"password"}).isString().isLength({min:6, max:20}).withMessage({message:"invalid password", field:"password"}),
    body('email').exists().withMessage({message:"email is not passed", field:"email"}).isString().matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/).withMessage({message:"invalid email", field:"email"}),
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
