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
const express_validator_1 = require("express-validator");
const posts_validartion_1 = require("../valodation/posts.validartion");
const auth_middleware_1 = require("../../auth/auth.middleware");
const db_init_1 = require("../../blogs/db/db.init");
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
exports.postRouter.post('/', (0, auth_middleware_1.authValidationMiddleware)(), (0, posts_validartion_1.postTitleValidation)(), (0, posts_validartion_1.postShortDescriptionValidation)(), (0, posts_validartion_1.postContenteValidation)(), (0, posts_validartion_1.postBlogIdValidation)(), (0, posts_validartion_1.authBlogIsExistsValidationMiddleware)(), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = (0, express_validator_1.validationResult)(req);
    const unathorised = result.array().find(error => error.msg === '401');
    if (unathorised) {
        return res.sendStatus(401);
    }
    if (!result.isEmpty()) {
        return res.status(400).send({ errorsMessages: result.array({ onlyFirstError: true }).map(error => error.msg) });
    }
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
exports.postRouter.put('/:id', (0, auth_middleware_1.authValidationMiddleware)(), (0, posts_validartion_1.postTitleValidation)(), (0, posts_validartion_1.postShortDescriptionValidation)(), (0, posts_validartion_1.postContenteValidation)(), (0, posts_validartion_1.postBlogIdValidation)(), (0, posts_validartion_1.authBlogIsExistsValidationMiddleware)(), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = (0, express_validator_1.validationResult)(req);
    // console.log(req.headers.authorization)
    const unathorised = result.array().find(error => error.msg === '401');
    if (unathorised) {
        return res.sendStatus(401);
    }
    if (!result.isEmpty()) {
        return res.status(400).send({ errorsMessages: result.array({ onlyFirstError: true }).map(error => error.msg) });
    }
    const postToUpdate = yield db_init_1.client.db("incubator").collection("posts").findOne({ id: req.params.id });
    if (!postToUpdate) {
        return res.status(404).send("post is not found");
    }
    const blogToFetch = yield db_init_1.client.db("incubator").collection("blogs").findOne({ id: req.body.blogId });
    if (!blogToFetch) {
        return res.status(400).send({ errorsMessages: [{ message: 'no such blog', field: 'blogId' }] });
    }
    // postToUpdate.title = req.body.title
    // postToUpdate.shortDescription = req.body.shortDescription
    // postToUpdate.content = req.body.content
    // postToUpdate.blogId = blogToFetch.id
    // postToUpdate.blogName =  blogToFetch.name
    yield db_init_1.client.db("incubator").collection("posts")
        .updateOne({ id: req.params.id }, { $set: { title: req.body.title,
            shortDescription: req.body.shortDescription,
            content: req.body.content,
            blogId: blogToFetch.id,
            blogName: blogToFetch.name } });
    return res.sendStatus(204);
}));
exports.postRouter.delete('/:id', (0, auth_middleware_1.authValidationMiddleware)(), (req, res) => {
    const result = (0, express_validator_1.validationResult)(req);
    const unathorised = result.array().find(error => error.msg === '401');
    if (unathorised) {
        return res.sendStatus(401);
    }
    const postToDelete = db_init_1.client.db("incubator").collection("posts").findOne({ id: req.params.id });
    if (!postToDelete) {
        return res.sendStatus(404);
    }
    db_init_1.client.db("incubator").collection("posts").findOneAndDelete({ id: req.params.id });
    return res.sendStatus(204);
});
