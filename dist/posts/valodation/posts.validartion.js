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
exports.postIsExistsById = exports.postBlogIsExistsById = exports.postBlogIdValidation = exports.postContenteValidation = exports.postShortDescriptionValidation = exports.postTitleValidation = void 0;
const express_validator_1 = require("express-validator");
const db_init_1 = require("../../blogs/db/db.init");
const postTitleValidation = () => (0, express_validator_1.body)('title').exists({ values: "falsy" }).withMessage({ message: 'title not passed', field: "title" }).isString().trim().isLength({ min: 1, max: 30 }).withMessage({ message: 'Invalid title', field: "title" });
exports.postTitleValidation = postTitleValidation;
const postShortDescriptionValidation = () => (0, express_validator_1.body)('shortDescription').exists({ values: "falsy" }).withMessage({ message: 'shortDescription not passed', field: "shortDescription" }).isString().trim().isLength({ min: 1, max: 100 }).withMessage({ message: 'Invalid shortDescription', field: "shortDescription" });
exports.postShortDescriptionValidation = postShortDescriptionValidation;
const postContenteValidation = () => (0, express_validator_1.body)('content').exists({ values: "falsy" }).withMessage({ message: 'Content not passed', field: "content" }).isString().trim().isLength({ min: 1, max: 1000 }).withMessage({ message: 'Invalid content', field: "content" });
exports.postContenteValidation = postContenteValidation;
const postBlogIdValidation = () => (0, express_validator_1.body)('blogId').exists({ values: "falsy" }).withMessage({ message: 'blogId not passed', field: "blogId" }).isString().withMessage({ message: 'Invalid blogId', field: "blogId" });
exports.postBlogIdValidation = postBlogIdValidation;
const postBlogIsExistsById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const blogToFetch = yield db_init_1.client.db("incubator").collection("blogs").findOne({ id: req.body.blogId });
    if (!blogToFetch) {
        return res.sendStatus(404);
    }
    return next();
});
exports.postBlogIsExistsById = postBlogIsExistsById;
const postIsExistsById = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const postToFetch = yield db_init_1.client.db("incubator").collection("posts").findOne({ id: req.params.id });
    if (!postToFetch) {
        return res.sendStatus(404);
    }
    return next();
});
exports.postIsExistsById = postIsExistsById;
