import { jwtUser } from "../app/jwt.service";
import { LikeStatus } from "../app/like-status.enum";
import { CommentType } from "../types/comments.type";

export const commentsRepository = {

    checkLikeStatus(commentToLike:CommentType, user: jwtUser){
        if(commentToLike.likesInfo.usersWhoLiked.indexOf(user.userId) === -1 && commentToLike.likesInfo.usersWhoDisliked.indexOf(user.userId) === -1){
            return false
        }else{
            return true
        }
    },

    removeLikeStatus(commentToLike:CommentType, user: jwtUser): void{

        const isDislikesIndex = commentToLike.likesInfo.usersWhoDisliked.indexOf(user.userId)
        const isLikesIndex = commentToLike.likesInfo.usersWhoLiked.indexOf(user.userId)

        if(isDislikesIndex !== -1){
            commentToLike.likesInfo.usersWhoDisliked.splice(isDislikesIndex, 1)
        }else{
            commentToLike.likesInfo.usersWhoLiked.splice(isLikesIndex, 1)
        }
    },

    addLikeStatus(commentToLike:CommentType, user: jwtUser, likeStatus: LikeStatus){

        switch(likeStatus){
            case LikeStatus.Dislike:
                commentToLike.likesInfo.usersWhoDisliked.push(user.userId)
                return commentToLike
            case LikeStatus.Like:
                commentToLike.likesInfo.usersWhoLiked.push(user.userId)
                return commentToLike
            case LikeStatus.None:
                return commentToLike
        }
    },

    changeLikeStatus(commentToLike:CommentType, user: jwtUser, likeStatus:LikeStatus) : CommentType{

        switch(likeStatus){
            case LikeStatus.Dislike:
                this.removeLikeStatus(commentToLike, user)
                this.addLikeStatus(commentToLike, user, likeStatus)
                return commentToLike
            case LikeStatus.Like:
                this.removeLikeStatus(commentToLike, user)
                this.addLikeStatus(commentToLike, user, likeStatus)
                return commentToLike
            case LikeStatus.None:
                this.removeLikeStatus(commentToLike, user)
                return commentToLike
        }
    },

}