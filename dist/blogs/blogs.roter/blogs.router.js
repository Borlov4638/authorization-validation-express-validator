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
const blogs_db_1 = require("../db/blogs.db");
const express_validator_1 = require("express-validator");
const blog_validatiom_1 = require("../validation/blog.validatiom");
const auth_middleware_1 = require("../../auth/auth.middleware");
exports.blogsRouter = (0, express_1.Router)({});
exports.blogsRouter.get('/', (req, res) => {
    res.status(200).send(blogs_db_1.blogsDB);
});
exports.blogsRouter.get('/:id', (req, res) => {
    const findedBlog = blogs_db_1.blogsDB.find(blog => blog.id === req.params.id);
    if (findedBlog) {
        res.status(200).send(findedBlog);
    }
    else {
        res.sendStatus(404);
    }
});
exports.blogsRouter.post('/', (0, auth_middleware_1.authValidationMiddleware)(), (0, blog_validatiom_1.blogNameValidation)(), (0, blog_validatiom_1.blogDescriptionValidation)(), (0, blog_validatiom_1.blogUrlValidation)(), (0, blog_validatiom_1.blogUrlMatchingValidation)(), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = (0, express_validator_1.validationResult)(req);
    const unathorised = result.array().find(error => error.msg === '401');
    if (unathorised) {
        return res.sendStatus(401);
    }
    if (!result.isEmpty()) {
        return res.status(400).send({ errorsMessages: result.array({ onlyFirstError: true }).map(error => error.msg) });
    }
    const newBlog = {
        id: (+new Date()).toString(),
        name: req.body.name,
        description: req.body.description,
        websiteUrl: req.body.websiteUrl
    };
    blogs_db_1.blogsDB.push(newBlog);
    return res.status(201).send(newBlog);
}));
exports.blogsRouter.put('/:id', (0, auth_middleware_1.authValidationMiddleware)(), (0, blog_validatiom_1.blogNameValidation)(), (0, blog_validatiom_1.blogDescriptionValidation)(), (0, blog_validatiom_1.blogUrlValidation)(), (0, blog_validatiom_1.blogUrlMatchingValidation)(), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = (0, express_validator_1.validationResult)(req);
    const unathorised = result.array().find(error => error.msg === '401');
    if (unathorised) {
        return res.sendStatus(401);
    }
    const findBlogToUpdate = blogs_db_1.blogsDB.find(blog => blog.id === req.params.id);
    if (!findBlogToUpdate) {
        return res.sendStatus(404);
    }
    if (!result.isEmpty()) {
        return res.status(400).send({ errorsMessages: result.array({ onlyFirstError: true }).map(error => error.msg) });
    }
    findBlogToUpdate.description = req.body.description;
    findBlogToUpdate.name = req.body.name;
    findBlogToUpdate.websiteUrl = req.body.websiteUrl;
    return res.sendStatus(204);
}));
exports.blogsRouter.delete('/:id', (0, auth_middleware_1.authValidationMiddleware)(), (req, res) => {
    const result = (0, express_validator_1.validationResult)(req);
    const unathorised = result.array().find(error => error.msg === '401');
    if (unathorised) {
        return res.sendStatus(401);
    }
    const findBlogToUpdate = blogs_db_1.blogsDB.find(blog => blog.id === req.params.id);
    if (!findBlogToUpdate) {
        return res.sendStatus(404);
    }
    blogs_db_1.blogsDB.splice(blogs_db_1.blogsDB.indexOf(findBlogToUpdate), 1);
    return res.sendStatus(204);
});
