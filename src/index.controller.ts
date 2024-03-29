import express, { Request, Response } from "express"
import { blogsRouter } from "./blogs/blogs.roter/blogs.router"
import { postRouter } from "./posts/posts.router/posts.router"
import { client } from "./blogs/db/db.init"
import { usersRouter } from "./users/users.router"
import { authRouter } from "./auth/auth.router"
import { commentsRouter } from "./comments/comments.router"
import cookieParser from "cookie-parser"
import { secDevRouter } from "./securityDevices/security-dev.router"
import { customRateLimit } from "./app/custom-rate-limit"

export const app = express()

app.use(express.json())

app.use(cookieParser()) 

app.use(customRateLimit)

app.use('/blogs',blogsRouter)

app.use('/posts', postRouter)

app.use('/users', usersRouter)

app.use('/auth', authRouter)

app.use('/comments', commentsRouter)

app.use('/security', secDevRouter)

app.delete('/testing/all-data', async (req:Request, res:Response) =>{
    await client.db("incubator").collection("blogs").deleteMany({})
    await client.db("incubator").collection("posts").deleteMany({})
    await client.db("incubator").collection("users").deleteMany({})
    await client.db("incubator").collection("comments").deleteMany({})
    await client.db('incubator').collection('deviceSessions').deleteMany({})
    await client.db('incubator').collection('apiRequests').deleteMany({})

    res.sendStatus(204)
})

app.delete('/testing/blogs', async (req:Request, res:Response) =>{
    await client.db("incubator").collection("blogs").deleteMany({})
    res.sendStatus(204)
})