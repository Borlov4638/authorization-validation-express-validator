import express, { Request, Response } from "express"
import { blogsRouter } from "./blogs/blogs.roter/blogs.router"
import { blogsDB } from "./blogs/db/blogs.db"
import { postRouter } from "./posts/posts.router/posts.router"
import { postsDB } from "./posts/db/posts.db"

export const app = express()

app.use(express.json())

app.use('/blogs',blogsRouter)

app.use('/posts', postRouter)

app.delete('/testing/all-data', (req:Request, res:Response) =>{
    blogsDB.splice(0, blogsDB.length)
    postsDB.splice(0, postsDB.length)
    res.sendStatus(204)
})