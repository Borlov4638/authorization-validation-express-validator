import { ObjectId } from 'mongodb';
import mongoose from 'mongoose';



const blogsScheme = new mongoose.Schema({
    name: {type: String, required: true},
    createdAt:{type: String, required: true},
    description:{type: String, required: true},
    id:{type: ObjectId},
    isMembership: Boolean,
    websiteUrl: {type: String, required: true}
  })
  
  
  export const BlogsModel = mongoose.model('blogs', blogsScheme)
  