"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authBlogIsExistsValidationMiddleware = exports.postBlogIdValidation = exports.postContenteValidation = exports.postShortDescriptionValidation = exports.postTitleValidation = void 0;
const express_validator_1 = require("express-validator");
const blogs_db_1 = require("../../blogs/db/blogs.db");
const postTitleValidation = () => (0, express_validator_1.body)('title').isString().trim().isLength({ min: 1, max: 30 }).withMessage({ message: 'Invalid title', field: "title" });
exports.postTitleValidation = postTitleValidation;
const postShortDescriptionValidation = () => (0, express_validator_1.body)('shortDescription').isString().trim().isLength({ min: 1, max: 100 }).withMessage({ message: 'Invalid shortDescription', field: "shortDescription" });
exports.postShortDescriptionValidation = postShortDescriptionValidation;
const postContenteValidation = () => (0, express_validator_1.body)('content').isString().trim().isLength({ min: 1, max: 1000 }).withMessage({ message: 'Invalid content', field: "content" });
exports.postContenteValidation = postContenteValidation;
const postBlogIdValidation = () => (0, express_validator_1.body)('blogId').isString().withMessage({ message: 'Invalid blogId', field: "blogId" });
exports.postBlogIdValidation = postBlogIdValidation;
const authBlogIsExistsValidationMiddleware = () => (0, express_validator_1.body)('blogId').custom((value, { req }) => {
    const blogToFetch = blogs_db_1.blogsDB.find(blog => blog.id === req.body.blogId);
    if (!blogToFetch) {
        return false;
    }
    return true;
}).withMessage({ message: 'no such blog', field: 'blogId' });
exports.authBlogIsExistsValidationMiddleware = authBlogIsExistsValidationMiddleware;
