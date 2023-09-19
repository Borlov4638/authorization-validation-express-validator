import { ObjectId } from "mongodb"
import { client } from "../blogs/db/db.init"
import { LikeStatus } from "../app/like-status.enum"
import { jwtUser } from "../app/jwt.service"
import { PostType } from "../types/posts.types"


export const postsRepository ={
    commentsSortingQuery(sortBy:string,sortDirection:number):{}{
        switch (sortBy){
            case "id":
                return {id: sortDirection}
            case "content":
                return {content: sortDirection}
            case "createdAt":
                return {createdAt: sortDirection}
            default:
                return {createdAt: 1}
        }

    },
    
    getLikeStatus(postToLike:PostType, user:jwtUser): LikeStatus{
        if(postToLike.extendedLikesInfo.usersWhoLiked.map(obj => obj.id).indexOf(user.userId)){
            return LikeStatus.Like
        }else if(postToLike.extendedLikesInfo.usersWhoDisliked.indexOf(user.userId)){
            return LikeStatus.Dislike
        }else{
            return LikeStatus.None
        }
    },

    clearLikeStatus(postToLike:PostType, user:jwtUser): void{
        const isLikeIndex = postToLike.extendedLikesInfo.usersWhoLiked.map(obj => obj.id).indexOf(user.userId)
        const isDislikeIndex = postToLike.extendedLikesInfo.usersWhoDisliked.indexOf(user.userId)
        if(isLikeIndex > -1){
            postToLike.extendedLikesInfo.usersWhoLiked.splice(isLikeIndex, 1)
        }else{
            postToLike.extendedLikesInfo.usersWhoDisliked.splice(isDislikeIndex, 1)
        }
    },

    createLikeStatus(postToLike: PostType, user: jwtUser, likeStatus: LikeStatus): PostType{
        if(likeStatus === LikeStatus.Like){
            postToLike.extendedLikesInfo.usersWhoLiked.push({id: user.userId, login: user.login, date: (+new Date())})
        }else if(likeStatus === LikeStatus.Dislike){
            postToLike.extendedLikesInfo.usersWhoDisliked.push(user.userId)
        }
        return postToLike
    },

    changeLikeStatus(postToLike: PostType, user: jwtUser, likeStatus: LikeStatus): PostType{
        this.clearLikeStatus(postToLike, user)
        return this.createLikeStatus(postToLike, user, likeStatus)
    }

}