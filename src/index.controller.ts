import express, { Request, Response } from "express"
import { blogsRouter } from "./blogs/blogs.roter/blogs.router"
import { blogsDB } from "./blogs/db/blogs.db"
import { postRouter } from "./posts/posts.router/posts.router"
import { postsDB } from "./posts/db/posts.db"
import { ClientRequest } from "http"
import { client } from "./blogs/db/db.init"

export const app = express()

app.use(express.json())

app.use('/blogs',blogsRouter)

app.use('/posts', postRouter)

app.delete('/testing/all-data', async (req:Request, res:Response) =>{
    await client.db("incubator").collection("blogs").deleteMany({})
    await client.db("incubator").collection("posts").deleteMany({})
    res.sendStatus(204)
})