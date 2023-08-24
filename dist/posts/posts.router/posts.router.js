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
exports.postRouter = (0, express_1.Router)({});
exports.postRouter.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const postsToReturn = yield db_init_1.client.db("incubator").collection("posts").find({}, { projection: { _id: 0 } }).toArray();
    res.status(200).send(postsToReturn);
}));
exports.postRouter.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const foundedPost = yield db_init_1.client.db("incubator").collection("posts").findOne({ id: req.params.id }, { projection: { _id: 0 } });
    if (!foundedPost) {
        return res.sendStatus(404);
    }
    return res.status(200).send(foundedPost);
}));
exports.postRouter.post('/', auth_middleware_1.authValidationMiddleware, 
// postBlogIsExistsById,
(0, posts_validartion_1.postTitleValidation)(), (0, posts_validartion_1.postShortDescriptionValidation)(), (0, posts_validartion_1.postContenteValidation)(), (0, posts_validartion_1.postBlogIdValidation)(), blog_validatiom_1.validationResultMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const blogToFetch = yield db_init_1.client.db("incubator").collection("blogs").findOne({ id: req.body.blogId });
    if (!blogToFetch) {
        return res.status(400).send({ errorsMessages: [{ message: 'no such blog', field: 'blogId' }] });
    }
    const newPost = {
        id: (+new Date()).toString(),
        title: req.body.title,
        shortDescription: req.body.shortDescription,
        content: req.body.content,
        blogId: blogToFetch.id,
        blogName: blogToFetch.name,
        createdAt: (new Date()).toISOString()
    };
    res.status(201).send(newPost);
    return yield db_init_1.client.db("incubator").collection("posts").insertOne(newPost);
}));
exports.postRouter.put('/:id', auth_middleware_1.authValidationMiddleware, posts_validartion_1.postIsExistsById, (0, posts_validartion_1.postTitleValidation)(), (0, posts_validartion_1.postShortDescriptionValidation)(), (0, posts_validartion_1.postContenteValidation)(), (0, posts_validartion_1.postBlogIdValidation)(), blog_validatiom_1.validationResultMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const blogToFetch = yield db_init_1.client.db("incubator").collection("blogs").findOne({ id: req.body.blogId });
    if (!blogToFetch) {
        return res.status(400).send({ errorsMessages: [{ message: 'no such blog', field: 'blogId' }] });
    }
    yield db_init_1.client.db("incubator").collection("posts")
        .updateOne({ id: req.params.id }, { $set: { title: req.body.title,
            shortDescription: req.body.shortDescription,
            content: req.body.content,
            blogId: blogToFetch.id,
            blogName: blogToFetch.name } });
    return res.sendStatus(204);
}));
exports.postRouter.delete('/:id', auth_middleware_1.authValidationMiddleware, posts_validartion_1.postIsExistsById, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    db_init_1.client.db("incubator").collection("posts").findOneAndDelete({ id: req.params.id });
    return res.sendStatus(204);
}));
