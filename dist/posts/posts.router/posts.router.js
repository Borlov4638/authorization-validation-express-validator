"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postRouter = void 0;
const express_1 = require("express");
const posts_db_1 = require("../db/posts.db");
const express_validator_1 = require("express-validator");
const blogs_db_1 = require("../../blogs/db/blogs.db");
const posts_validartion_1 = require("../valodation/posts.validartion");
const auth_middleware_1 = require("../../auth/auth.middleware");
exports.postRouter = (0, express_1.Router)({});
exports.postRouter.get('/', (req, res) => {
    res.status(200).send(posts_db_1.postsDB);
});
exports.postRouter.get('/:id', (req, res) => {
    const foundedPost = posts_db_1.postsDB.find(post => post.id === req.params.id);
    if (!foundedPost) {
        return res.sendStatus(404);
    }
    return res.status(200).send(foundedPost);
});
exports.postRouter.post('/', (0, auth_middleware_1.authValidationMiddleware)(), (0, posts_validartion_1.postTitleValidation)(), (0, posts_validartion_1.postShortDescriptionValidation)(), (0, posts_validartion_1.postContenteValidation)(), (0, posts_validartion_1.postBlogIdValidation)(), (0, posts_validartion_1.authBlogIsExistsValidationMiddleware)(), (req, res) => {
    const result = (0, express_validator_1.validationResult)(req);
    const unathorised = result.array().find(error => error.msg === '401');
    if (unathorised) {
        return res.sendStatus(401);
    }
    if (!result.isEmpty()) {
        return res.status(400).send({ errorsMessages: result.array({ onlyFirstError: true }).map(error => error.msg) });
    }
    const blogToFetch = blogs_db_1.blogsDB.find(blog => blog.id === req.body.blogId);
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
    posts_db_1.postsDB.push(newPost);
    return res.status(201).send(newPost);
});
exports.postRouter.put('/:id', (0, auth_middleware_1.authValidationMiddleware)(), (0, posts_validartion_1.postTitleValidation)(), (0, posts_validartion_1.postShortDescriptionValidation)(), (0, posts_validartion_1.postContenteValidation)(), (0, posts_validartion_1.postBlogIdValidation)(), (0, posts_validartion_1.authBlogIsExistsValidationMiddleware)(), (req, res) => {
    const postToUpdate = posts_db_1.postsDB.find(post => post.id === req.params.id);
    const result = (0, express_validator_1.validationResult)(req);
    console.log(req.headers.authorization);
    const unathorised = result.array().find(error => error.msg === '401');
    if (unathorised) {
        return res.sendStatus(401);
    }
    if (!result.isEmpty()) {
        return res.status(400).send({ errorsMessages: result.array({ onlyFirstError: true }).map(error => error.msg) });
    }
    if (!postToUpdate) {
        return res.sendStatus(404);
    }
    const blogToFetch = blogs_db_1.blogsDB.find(blog => blog.id === req.body.blogId);
    if (!blogToFetch) {
        return res.status(400).send({ errorsMessages: [{ message: 'no such blog', field: 'blogId' }] });
    }
    postToUpdate.title = req.body.title;
    postToUpdate.shortDescription = req.body.shortDescription;
    postToUpdate.content = req.body.content;
    postToUpdate.blogId = blogToFetch.id;
    postToUpdate.blogName = blogToFetch.name;
    return res.sendStatus(204);
});
exports.postRouter.delete('/:id', (0, auth_middleware_1.authValidationMiddleware)(), (req, res) => {
    const postToDelete = posts_db_1.postsDB.find(post => post.id === req.params.id);
    const result = (0, express_validator_1.validationResult)(req);
    const unathorised = result.array().find(error => error.msg === '401');
    if (unathorised) {
        return res.sendStatus(401);
    }
    if (!postToDelete) {
        return res.sendStatus(404);
    }
    posts_db_1.postsDB.splice(posts_db_1.postsDB.indexOf(postToDelete), 1);
    return res.sendStatus(204);
});
