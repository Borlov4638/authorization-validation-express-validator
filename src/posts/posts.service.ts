import { ObjectId } from "mongodb"
import { client } from "../blogs/db/db.init"
import { PostType } from "../types/posts.types"
import { jwtUser } from "../app/jwt.service"
import { LikeStatus } from "../app/like-status.enum"
import { postsRepository } from "./posts.repository"

export const postsService = {
    async getPostById(postId:string){
        return await client.db('incubator').collection('posts').findOne({_id:new ObjectId(postId)})
    },
    
    async changeLikeStatus(postToLike: PostType, user: jwtUser, likeStatus:LikeStatus){
        const isPostLiked = postsRepository.getLikeStatus(postToLike, user)
        
        const likedPost = (isPostLiked === LikeStatus.None) ? postsRepository.createLikeStatus(postToLike, user, likeStatus) : postsRepository.changeLikeStatus(postToLike, user, likeStatus)

        try{
            await client.db('incubator').collection('posts').updateOne({_id: new ObjectId(postToLike.id)}, {$set: { extendedLikesInfo: likedPost.extendedLikesInfo }})
            return true
        }catch(err){
            console.log(err)
            return false
        }
    }
    
}