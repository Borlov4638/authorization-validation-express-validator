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
const express_validator_1 = require("express-validator");
const blog_validatiom_1 = require("../validation/blog.validatiom");
const auth_middleware_1 = require("../../auth/auth.middleware");
const db_init_1 = require("../db/db.init");
exports.blogsRouter = (0, express_1.Router)({});
exports.blogsRouter.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const blogsToSend = yield db_init_1.client.db("incubator").collection("blogs").find({}, { projection: { _id: 0 } }).toArray();
    res.status(200).send(blogsToSend);
}));
exports.blogsRouter.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const findedBlog = yield db_init_1.client.db("incubator").collection("blogs").findOne({ id: req.params.id }, { projection: { _id: 0 } });
    if (findedBlog) {
        res.status(200).send(findedBlog);
    }
    else {
        res.sendStatus(404);
    }
}));
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
        websiteUrl: req.body.websiteUrl,
        createdAt: (new Date()).toISOString(),
        isMembership: true
    };
    res.status(201).send(newBlog);
    return yield db_init_1.client.db("incubator").collection("blogs").insertOne(newBlog);
    // blogsDB.push(newBlog)
}));
exports.blogsRouter.put('/:id', (0, auth_middleware_1.authValidationMiddleware)(), (0, blog_validatiom_1.blogNameValidation)(), (0, blog_validatiom_1.blogDescriptionValidation)(), (0, blog_validatiom_1.blogUrlValidation)(), (0, blog_validatiom_1.blogUrlMatchingValidation)(), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = (0, express_validator_1.validationResult)(req);
    const unathorised = result.array().find(error => error.msg === '401');
    if (unathorised) {
        return res.sendStatus(401);
    }
    const findBlogToUpdate = yield db_init_1.client.db("incubator").collection("blogs").findOne({ id: req.params.id });
    // const findBlogToUpdate = blogsDB.find(blog => blog.id === req.params.id)
    if (!findBlogToUpdate) {
        return res.sendStatus(404);
    }
    if (!result.isEmpty()) {
        return res.status(400).send({ errorsMessages: result.array({ onlyFirstError: true }).map(error => error.msg) });
    }
    // findBlogToUpdate.description = req.body.description
    // findBlogToUpdate.name = req.body.name
    // findBlogToUpdate.websiteUrl = req.body.websiteUrl
    yield db_init_1.client.db("incubator").collection("blogs").updateOne({ id: req.params.id }, { $set: { websiteUrl: req.body.websiteUrl, name: req.body.name, description: req.body.description } });
    return res.sendStatus(204);
}));
exports.blogsRouter.delete('/:id', (0, auth_middleware_1.authValidationMiddleware)(), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = (0, express_validator_1.validationResult)(req);
    const unathorised = result.array().find(error => error.msg === '401');
    if (unathorised) {
        return res.sendStatus(401);
    }
    const findBlogToDelete = yield db_init_1.client.db("incubator").collection("blogs").findOne({ id: req.params.id });
    // const findBlogToUpdate = blogsDB.find(blog => blog.id === req.params.id)
    if (!findBlogToDelete) {
        return res.sendStatus(404);
    }
    db_init_1.client.db("incubator").collection("blogs").deleteOne({ id: req.params.id });
    // blogsDB.splice(blogsDB.indexOf(findBlogToUpdate), 1)
    return res.sendStatus(204);
}));
