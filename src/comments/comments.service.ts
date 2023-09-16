import { LikeStatus } from "../app/like-status.enum";
import { jwtService, jwtUser } from "../app/jwt.service";
import { CommentType } from "../types/comments.type";
import { commentsRepository } from "./comments.repo";
import { client } from "../blogs/db/db.init";
import { ObjectId } from "mongodb";

export const commentService = {
    changeLikeStatus(user: jwtUser, commentToLike:CommentType, likeStatus:LikeStatus){

        const usersLikeStatus = commentsRepository.checkLikeStatus(commentToLike, user)
        if(usersLikeStatus){
            return commentsRepository.changeLikeStatus(commentToLike, user, likeStatus)
        }else{
            return commentsRepository.addLikeStatus(commentToLike, user, likeStatus)
        }
    },

    async getCommentById(commentId:string, token: string | undefined){

        const findedComment = await client.db('incubator').collection('comments').findOne({_id: new ObjectId(commentId)}, {projection:{_id:0, postId:0}}) as CommentType

        if(!findedComment){
            return false
        }
        let myStatus = LikeStatus.None
        if(token){
            const user = jwtService.getAllTokenData(token) as jwtUser
            if(user){
                myStatus = commentsRepository.getLikeStatus(findedComment, user)
            }
        }

        const likesCount = findedComment.likesInfo.usersWhoLiked.length
        const dislikesCount = findedComment.likesInfo.usersWhoDisliked.length

        return {...findedComment, likesInfo:{likesCount, dislikesCount, myStatus}}
    }
}