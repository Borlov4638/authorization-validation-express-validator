import express, { Request, Response } from "express"
import { blogsRouter } from "./blogs/blogs.roter/blogs.router"
import { postRouter } from "./posts/posts.router/posts.router"
import { client } from "./blogs/db/db.init"
import { usersRouter } from "./users/users.router"
import { authRouter } from "./auth/auth.router"
import { commentsRouter } from "./comments/comments.router"

export const app = express()

app.use(express.json())

app.use('/blogs',blogsRouter)

app.use('/posts', postRouter)

app.use('/users', usersRouter)

app.use('/auth', authRouter)

app.use('/comments', commentsRouter)

app.delete('/testing/all-data', async (req:Request, res:Response) =>{
    await client.db("incubator").collection("blogs").deleteMany({})
    await client.db("incubator").collection("posts").deleteMany({})
    await client.db("incubator").collection("users").deleteMany({})
    await client.db("incubator").collection("comments").deleteMany({})
    res.sendStatus(204)
})