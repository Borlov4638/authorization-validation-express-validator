"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.postRouter = void 0;
const express_1 = require("express");
const posts_validartion_1 = require("../valodation/posts.validartion");
const auth_middleware_1 = require("../../auth/auth.middleware");
const db_init_1 = require("../../blogs/db/db.init");
const blog_validatiom_1 = require("../../blogs/validation/blog.validatiom");
const mongodb_1 = require("mongodb");
const blogs_repository_1 = require("../../blogs/repository/blogs.repository");
const jwt_service_1 = require("../../app/jwt.service");
const posts_repository_1 = require("../posts.repository");
const comments_validation_1 = require("../../comments/comments.validation");
const like_status_enum_1 = require("../../app/like-status.enum");
const comments_repo_1 = require("../../comments/comments.repo");
const posts_service_1 = require("../posts.service");
exports.postRouter = (0, express_1.Router)({});
exports.postRouter.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const sortBy = (req.query.sortBy) ? req.query.sortBy : "createdAt";
    const sortDirection = (req.query.sortDirection === "asc") ? 1 : -1;
    const sotringQuery = blogs_repository_1.blogsRepository.postsSortingQuery(sortBy, sortDirection);
    const pageNumber = (req.query.pageNumber) ? +req.query.pageNumber : 1;
    const pageSize = (req.query.pageSize) ? +req.query.pageSize : 10;
    const itemsToSkip = (pageNumber - 1) * pageSize;
    const blogsToSend = yield db_init_1.client.db("incubator").collection("posts").find({}, { projection: { _id: 0 } })
        .sort(sotringQuery)
        .skip(itemsToSkip)
        .limit(pageSize)
        .toArray();
    const totalCountOfItems = yield db_init_1.client.db("incubator").collection("posts")
        .find({}).toArray();
    const mappedResponse = {
        pagesCount: Math.ceil(totalCountOfItems.length / pageSize),
        page: pageNumber,
        pageSize: pageSize,
        totalCount: totalCountOfItems.length,
        items: [...blogsToSend]
    };
    res.status(200).send(mappedResponse);
}));
exports.postRouter.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const foundedPost = yield db_init_1.client.db("incubator").collection("posts").findOne({ _id: new mongodb_1.ObjectId(`${req.params.id}`) }, { projection: { _id: 0 } });
    if (!foundedPost) {
        return res.sendStatus(404);
    }
    return res.status(200).send(foundedPost);
}));
exports.postRouter.post('/', auth_middleware_1.authValidationMiddleware, (0, posts_validartion_1.postTitleValidation)(), (0, posts_validartion_1.postShortDescriptionValidation)(), (0, posts_validartion_1.postContenteValidation)(), (0, posts_validartion_1.postBlogIdValidation)(), blog_validatiom_1.validationResultMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const blogToFetch = yield db_init_1.client.db("incubator").collection("blogs").findOne({ _id: new mongodb_1.ObjectId(req.body.blogId) });
    if (!blogToFetch) {
        return res.status(400).send({ errorsMessages: [{ message: 'no such blog', field: 'blogId' }] });
    }
    const newPost = {
        title: req.body.title,
        shortDescription: req.body.shortDescription,
        content: req.body.content,
        blogId: blogToFetch.id,
        blogName: blogToFetch.name,
        createdAt: (new Date()).toISOString(),
        extendedLikesInfo: {
            usersWhoLiked: [],
            usersWhoDisliked: []
        }
    };
    const insertedPost = yield db_init_1.client.db("incubator").collection("posts").insertOne(newPost);
    yield db_init_1.client.db("incubator").collection("posts").updateOne({ _id: insertedPost.insertedId }, { $set: { id: insertedPost.insertedId } });
    const postToShow = yield db_init_1.client.db("incubator").collection("posts").findOne({ _id: insertedPost.insertedId }, { projection: { _id: 0, extendedLikesInfo: 0 } });
    return res.status(201).send(Object.assign(Object.assign({}, postToShow), { extendedLikesInfo: {
            likesCount: 0,
            dislikesCount: 0,
            myStatus: like_status_enum_1.LikeStatus.None,
            newestLikes: []
        } }));
}));
exports.postRouter.put('/:id', auth_middleware_1.authValidationMiddleware, posts_validartion_1.postIsExistsById, (0, posts_validartion_1.postTitleValidation)(), (0, posts_validartion_1.postShortDescriptionValidation)(), (0, posts_validartion_1.postContenteValidation)(), (0, posts_validartion_1.postBlogIdValidation)(), blog_validatiom_1.validationResultMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const blogToFetch = yield db_init_1.client.db("incubator").collection("blogs").findOne({ _id: new mongodb_1.ObjectId(req.body.blogId) });
    if (!blogToFetch) {
        return res.status(400).send({ errorsMessages: [{ message: 'no such blog', field: 'blogId' }] });
    }
    yield db_init_1.client.db("incubator").collection("posts")
        .updateOne({ _id: new mongodb_1.ObjectId(req.params.id) }, { $set: { title: req.body.title,
            shortDescription: req.body.shortDescription,
            content: req.body.content,
            blogId: blogToFetch.id,
            blogName: blogToFetch.name } });
    return res.sendStatus(204);
}));
exports.postRouter.delete('/:id', auth_middleware_1.authValidationMiddleware, posts_validartion_1.postIsExistsById, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const deleted = yield db_init_1.client.db("incubator").collection("posts").deleteOne({ _id: new mongodb_1.ObjectId(req.params.id) });
    if (deleted.deletedCount < 1) {
        return res.sendStatus(404);
    }
    return res.sendStatus(204);
}));
exports.postRouter.post('/:postId/comments', auth_middleware_1.bearerAuthorization, (0, comments_validation_1.commentsContentValidation)(), blog_validatiom_1.validationResultMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const postToComment = yield db_init_1.client.db('incubator').collection('posts').findOne({ _id: new mongodb_1.ObjectId(req.params.postId) });
    if (!postToComment) {
        return res.sendStatus(404);
    }
    if (!req.headers.authorization) {
        return res.sendStatus(401);
    }
    const userInfo = jwt_service_1.jwtService.getUserByToken(req.headers.authorization);
    if (!userInfo) {
        return res.sendStatus(401);
    }
    const newComment = {
        content: req.body.content,
        commentatorInfo: {
            userId: userInfo.userId,
            userLogin: userInfo.login
        },
        createdAt: new Date().toISOString(),
        postId: postToComment._id,
        likesInfo: {
            usersWhoLiked: [],
            usersWhoDisliked: []
        }
    };
    const insertedComment = yield db_init_1.client.db('incubator').collection('comments').insertOne(newComment);
    yield db_init_1.client.db('incubator').collection('comments').updateOne({ _id: insertedComment.insertedId }, { $set: { id: insertedComment.insertedId } });
    const commentToShow = yield db_init_1.client.db('incubator').collection('comments').findOne({ _id: insertedComment.insertedId }, { projection: { _id: 0, postId: 0, likesInfo: 0 } });
    commentToShow.likesInfo = {
        dislikesCount: 0,
        likesCount: 0,
        myStatus: like_status_enum_1.LikeStatus.None
    };
    return res.status(201).send(commentToShow);
}));
exports.postRouter.get('/:postId/comments', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const postToComment = yield db_init_1.client.db("incubator").collection("posts").findOne({ _id: new mongodb_1.ObjectId(req.params.postId) });
    if (!postToComment) {
        return res.sendStatus(404);
    }
    const sortBy = (req.query.sortBy) ? req.query.sortBy : "createdAt";
    const sortDirection = (req.query.sortDirection === "asc") ? 1 : -1;
    const sotringQuery = posts_repository_1.postsRepository.commentsSortingQuery(sortBy, sortDirection);
    const pageNumber = (req.query.pageNumber) ? +req.query.pageNumber : 1;
    const pageSize = (req.query.pageSize) ? +req.query.pageSize : 10;
    const itemsToSkip = (pageNumber - 1) * pageSize;
    const selectedComments = yield db_init_1.client.db("incubator").collection("comments").find({ postId: postToComment._id }, { projection: { _id: 0, postId: 0 } })
        .sort(sotringQuery)
        .skip(itemsToSkip)
        .limit(pageSize)
        .toArray();
    const token = req.headers.authorization;
    const commentsToSend = selectedComments.map(comm => {
        let myStatus = like_status_enum_1.LikeStatus.None;
        if (token) {
            const user = jwt_service_1.jwtService.getAllTokenData(token);
            if (user) {
                myStatus = comments_repo_1.commentsRepository.getLikeStatus(comm, user);
            }
        }
        const likesCount = comm.likesInfo.usersWhoLiked.length;
        const dislikesCount = comm.likesInfo.usersWhoDisliked.length;
        return Object.assign(Object.assign({}, comm), { likesInfo: { likesCount, dislikesCount, myStatus } });
    });
    const totalCountOfItems = yield db_init_1.client.db("incubator").collection("comments")
        .find({ postId: postToComment._id }).toArray();
    const mappedResponse = {
        pagesCount: Math.ceil(totalCountOfItems.length / pageSize),
        page: pageNumber,
        pageSize: pageSize,
        totalCount: totalCountOfItems.length,
        items: [...commentsToSend]
    };
    return res.status(200).send(mappedResponse);
}));
exports.postRouter.post('/:postId/like-status', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.headers.authorization) {
        return res.sendStatus(401);
    }
    const user = jwt_service_1.jwtService.getAllTokenData(req.headers.authorization);
    if (!user) {
        return res.sendStatus(401);
    }
    const postToLike = yield posts_service_1.postsService.getPostById(req.params.postId);
    if (!postToLike) {
        return res.sendStatus(404);
    }
    const likeStatuses = Object.values(like_status_enum_1.LikeStatus);
    if (!likeStatuses.includes(req.body.likeStatus)) {
        return res.status(400).send({ errorsMessages: [
                {
                    message: "invalid like status",
                    field: "likeStatus"
                }
            ] });
    }
    const isLikeSet = yield posts_service_1.postsService.changeLikeStatus(postToLike, user, req.body.likeStatus);
    if (isLikeSet) {
        return res.sendStatus(204);
    }
    else {
        return res.sendStatus(500);
    }
}));
