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
exports.blogsRouter = void 0;
const express_1 = require("express");
const blog_validatiom_1 = require("../validation/blog.validatiom");
const auth_middleware_1 = require("../../auth/auth.middleware");
const db_init_1 = require("../db/db.init");
const mongodb_1 = require("mongodb");
const blogs_repository_1 = require("../repository/blogs.repository");
const posts_validartion_1 = require("../../posts/valodation/posts.validartion");
const like_status_enum_1 = require("../../app/like-status.enum");
const jwt_service_1 = require("../../app/jwt.service");
const posts_repository_1 = require("../../posts/posts.repository");
exports.blogsRouter = (0, express_1.Router)({});
exports.blogsRouter.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const searchNameTerm = (req.query.searchNameTerm) ? req.query.searchNameTerm : '';
    const sortBy = (req.query.sortBy) ? req.query.sortBy : "createdAt";
    const sortDirection = (req.query.sortDirection === "asc") ? 1 : -1;
    const sotringQuery = blogs_repository_1.blogsRepository.blogsSortingQuery(sortBy, sortDirection);
    const pageNumber = (req.query.pageNumber) ? +req.query.pageNumber : 1;
    const pageSize = (req.query.pageSize) ? +req.query.pageSize : 10;
    const itemsToSkip = (pageNumber - 1) * pageSize;
    const blogsToSend = yield db_init_1.client.db("incubator").collection("blogs").find({ name: { $regex: searchNameTerm, $options: 'i' } }, { projection: { _id: 0 } })
        .sort(sotringQuery)
        .skip(itemsToSkip)
        .limit(pageSize)
        .toArray();
    const totalCountOfItems = yield db_init_1.client.db("incubator").collection("blogs")
        .find({ name: { $regex: searchNameTerm, $options: 'i' } }).toArray();
    const mappedResponse = {
        pagesCount: Math.ceil(totalCountOfItems.length / pageSize),
        page: pageNumber,
        pageSize: pageSize,
        totalCount: totalCountOfItems.length,
        items: [...blogsToSend]
    };
    res.status(200).send(mappedResponse);
}));
exports.blogsRouter.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const requestId = new mongodb_1.ObjectId(`${req.params.id}`);
    const findedBlog = yield db_init_1.client.db("incubator").collection("blogs").findOne({ _id: requestId }, { projection: { _id: 0 } });
    if (findedBlog) {
        res.status(200).send(findedBlog);
    }
    else {
        res.sendStatus(404);
    }
}));
exports.blogsRouter.post('/', auth_middleware_1.authValidationMiddleware, (0, blog_validatiom_1.blogNameValidation)(), (0, blog_validatiom_1.blogDescriptionValidation)(), (0, blog_validatiom_1.blogUrlValidation)(), (0, blog_validatiom_1.blogUrlMatchingValidation)(), blog_validatiom_1.validationResultMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const newBlog = {
        name: req.body.name,
        description: req.body.description,
        websiteUrl: req.body.websiteUrl,
        createdAt: (new Date()).toISOString(),
        isMembership: false
    };
    const insertedPost = yield db_init_1.client.db("incubator").collection("blogs").insertOne(newBlog);
    yield db_init_1.client.db("incubator").collection("blogs").updateOne({ _id: insertedPost.insertedId }, { $set: { id: insertedPost.insertedId } });
    const blogToShow = yield db_init_1.client.db("incubator").collection("blogs").findOne({ _id: insertedPost.insertedId }, { projection: { _id: 0 } });
    return res.status(201).send(blogToShow);
}));
exports.blogsRouter.put('/:id', auth_middleware_1.authValidationMiddleware, (0, blog_validatiom_1.blogNameValidation)(), (0, blog_validatiom_1.blogDescriptionValidation)(), (0, blog_validatiom_1.blogUrlValidation)(), (0, blog_validatiom_1.blogUrlMatchingValidation)(), blog_validatiom_1.validationResultMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const requestId = new mongodb_1.ObjectId(`${req.params.id}`);
    const findBlogToUpdate = yield db_init_1.client.db("incubator").collection("blogs").find({ _id: requestId }).toArray();
    if (findBlogToUpdate.length < 1) {
        return res.sendStatus(404);
    }
    yield db_init_1.client.db("incubator").collection("blogs").updateOne({ _id: requestId }, { $set: { websiteUrl: req.body.websiteUrl, name: req.body.name, description: req.body.description } });
    return res.sendStatus(204);
}));
exports.blogsRouter.delete('/:id', auth_middleware_1.authValidationMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const requestId = new mongodb_1.ObjectId(`${req.params.id}`);
    const deleted = yield db_init_1.client.db("incubator").collection("blogs").deleteOne({ _id: requestId });
    if (deleted.deletedCount < 1) {
        return res.sendStatus(404);
    }
    return res.sendStatus(204);
}));
exports.blogsRouter.get('/:blogId/posts', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const blogToInsert = yield db_init_1.client.db("incubator").collection("blogs").findOne({ _id: new mongodb_1.ObjectId(req.params.blogId) });
    if (!blogToInsert) {
        return res.sendStatus(404);
    }
    const sortBy = (req.query.sortBy) ? req.query.sortBy : "createdAt";
    const sortDirection = (req.query.sortDirection === "asc") ? 1 : -1;
    const sotringQuery = blogs_repository_1.blogsRepository.postsSortingQuery(sortBy, sortDirection);
    const pageNumber = (req.query.pageNumber) ? +req.query.pageNumber : 1;
    const pageSize = (req.query.pageSize) ? +req.query.pageSize : 10;
    const itemsToSkip = (pageNumber - 1) * pageSize;
    const findedPosts = yield db_init_1.client.db("incubator").collection("posts").find({ blogId: blogToInsert._id }, { projection: { _id: 0 } })
        .sort(sotringQuery)
        .skip(itemsToSkip)
        .limit(pageSize)
        .toArray();
    const postsToSend = findedPosts.map(blog => {
        const likesCount = blog.extendedLikesInfo.usersWhoLiked.length;
        const dislikesCount = blog.extendedLikesInfo.usersWhoDisliked.length;
        let likes = blog.extendedLikesInfo.usersWhoLiked.sort((a, b) => b.addedAt - a.addedAt).slice(0, 3);
        const newestLikes = likes.map(user => { return { userId: user.userId, login: user.login, addedAt: new Date(user.addedAt).toISOString() }; });
        let myStatus = like_status_enum_1.LikeStatus.None;
        if (req.headers.authorization) {
            const user = jwt_service_1.jwtService.getAllTokenData(req.headers.authorization);
            if (user) {
                myStatus = posts_repository_1.postsRepository.getLikeStatus(blog, user);
            }
        }
        return Object.assign(Object.assign({}, blog), { extendedLikesInfo: {
                likesCount,
                dislikesCount,
                myStatus,
                newestLikes
            } });
    });
    const totalCountOfItems = yield db_init_1.client.db("incubator").collection("posts")
        .find({ blogId: blogToInsert._id }).toArray();
    const mappedResponse = {
        pagesCount: Math.ceil(totalCountOfItems.length / pageSize),
        page: pageNumber,
        pageSize: pageSize,
        totalCount: totalCountOfItems.length,
        items: [...postsToSend]
    };
    return res.status(200).send(mappedResponse);
}));
exports.blogsRouter.post('/:blogId/posts', auth_middleware_1.authValidationMiddleware, (0, posts_validartion_1.postTitleValidation)(), (0, posts_validartion_1.postShortDescriptionValidation)(), (0, posts_validartion_1.postContenteValidation)(), blog_validatiom_1.validationResultMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const blogToInsert = yield db_init_1.client.db("incubator").collection("blogs").findOne({ _id: new mongodb_1.ObjectId(req.params.blogId) });
    if (!blogToInsert) {
        return res.sendStatus(404);
    }
    const newPost = {
        title: req.body.title,
        shortDescription: req.body.shortDescription,
        content: req.body.content,
        blogId: blogToInsert.id,
        blogName: blogToInsert.name,
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
