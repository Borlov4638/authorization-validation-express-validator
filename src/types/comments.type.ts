import { ObjectId } from "mongodb"
import { server } from "typescript"

export type CommentType = {
    _id: ObjectId,
    content:string,
    commentatorInfo:{
        userId:string,
        userLogin:string
    },
    createdAt:string,
    postId: ObjectId,
    likesInfo:{
        usersWhoLiked:Array<string>,
        usersWhoDisliked: Array<string>
    },
    id:ObjectId
}