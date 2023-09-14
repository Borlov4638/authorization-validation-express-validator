import { ObjectId } from 'mongodb';
import mongoose from 'mongoose';
import { BlogType } from '../../types/blogs.type';



const blogsScheme = new mongoose.Schema({
    _id: {type: ObjectId},
	name: {type: String, required: true},
	createdAt:{type: String, required: true},
	description:{type: String, required: true},
	id:{type: ObjectId},
	isMembership: Boolean,
	websiteUrl: {type: String, required: true}
})
  
  
export const BlogsModel = mongoose.model('blogs', blogsScheme)

export const blogsDbRepo = {

	async createNewBlog(newblog : BlogType){
        try{
            await BlogsModel.create(newblog)
            const blogToReturn = BlogsModel.find({_id:newblog._id}).select({_id:0, __v:0}).lean()
            return blogToReturn
        } catch(err){
            console.log(err)
            return null
        }
    }
}
  