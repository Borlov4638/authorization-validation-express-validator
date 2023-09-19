import { ObjectId } from "mongodb"

export type PostType ={
    _id: ObjectId
    id: ObjectId,
    title: string,
    shortDescription: string,
    content: string,
    blogId: string,
    blogName: string,
    createdAt: string
    extendedLikesInfo:{
        usersWhoLiked: [
            {
                id:string,
                login:string
                date: number
            },
        ],
        usersWhoDisliked: Array<string>
    }

}