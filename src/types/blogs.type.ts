import { ObjectId } from "mongodb"

export type BlogType = {

    _id: ObjectId,
    id: ObjectId,
    name: string,
    description:string,
    websiteUrl:string,
    createdAt: string,
    isMembership: boolean
}