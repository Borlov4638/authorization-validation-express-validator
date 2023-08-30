import { ObjectId } from "mongodb"

export type UserType  = {
    createdAt: string,
    login: string,
    password: string,
    email:string,
    id: ObjectId
}