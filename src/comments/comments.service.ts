import { LikeStatus } from "../app/like-status.enum";
import { jwtUser } from "../app/jwt.service";
import { CommentType } from "../types/comments.type";
import { commentsRepository } from "./comments.repo";

export const commentService = {
    changeLikeStatus(user: jwtUser, commentToLike:CommentType, likeStatus:LikeStatus){

        const usersLikeStatus = commentsRepository.checkLikeStatus(commentToLike, user)
        if(usersLikeStatus){
            return commentsRepository.changeLikeStatus(commentToLike, user, likeStatus)
        }else{
            return commentsRepository.addLikeStatus(commentToLike, user, likeStatus)
        }
    }
}