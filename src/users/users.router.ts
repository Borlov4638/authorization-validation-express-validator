import { Response, Router } from "express";
import { RequestWithBody, RequestWithParam, RequestWithQuery } from "../types/blogs.request.types";
import { validationResultMiddleware } from "../blogs/validation/blog.validatiom";
import { usersEmailValidation, usersLoginValidation, usersPasswordValidation } from "./users.validation";
import { authValidationMiddleware } from "../auth/auth.middleware";
import { usersService } from "./users.service";

export const usersRouter = Router({})

usersRouter.get('/', authValidationMiddleware, async (req:RequestWithQuery<{sortBy:string, sortDirection:string, pageNumber:number, pageSize: number, searchLoginTerm:string, searchEmailTerm:string}>, res:Response) =>{
    
    const usersList = await usersService.getUsersWithPaganation(req.query.pageNumber, req.query.pageSize, req.query.searchEmailTerm, req.query.searchLoginTerm, req.query.sortBy, req.query.sortDirection)

    res.status(200).send(usersList)
})

usersRouter.post('/',
    authValidationMiddleware,
    usersLoginValidation(),
    usersEmailValidation(),
    usersPasswordValidation(),
    validationResultMiddleware,
    async (req:RequestWithBody<{login:string, password:string, email:string}>, res:Response) =>{

        const createdUser = await usersService.createNewUser(req.body.login, req.body.password, req.body.email, true)

        res.status(201).send(createdUser)
})

usersRouter.delete('/:id', authValidationMiddleware, async (req:RequestWithParam<{id:string}>, res:Response) =>{
    
    const userIsDeleted = await usersService.deleteUser(req.params.id)

    if(userIsDeleted){
        return res.sendStatus(204)
    }
    else{
        return res.sendStatus(404)
    }

})
