"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validationResultMiddleware = exports.blogUrlMatchingValidation = exports.blogUrlValidation = exports.blogDescriptionValidation = exports.blogNameValidation = void 0;
const express_validator_1 = require("express-validator");
const blogNameValidation = () => (0, express_validator_1.body)('name').exists({ values: "falsy" }).withMessage({ message: 'name not passed', field: "name" }).isString().trim().isLength({ min: 1, max: 15 }).withMessage({ message: 'Invalid name', field: "name" });
exports.blogNameValidation = blogNameValidation;
const blogDescriptionValidation = () => (0, express_validator_1.body)('description').exists({ values: "falsy" }).withMessage({ message: 'description not passed', field: "description" }).isString().trim().isLength({ min: 1, max: 500 }).withMessage({ message: 'Invalid description', field: "description" });
exports.blogDescriptionValidation = blogDescriptionValidation;
const blogUrlValidation = () => (0, express_validator_1.body)('websiteUrl').exists({ values: "falsy" }).withMessage({ message: 'websiteUrl not passed', field: "websiteUrl" }).isString().trim().isLength({ min: 1, max: 100 }).withMessage({ message: 'Invalid websiteUrl', field: "websiteUrl" });
exports.blogUrlValidation = blogUrlValidation;
const blogUrlMatchingValidation = () => (0, express_validator_1.body)('websiteUrl').matches(/^https:\/\/([a-zA-Z0-9_-]+\.)+[a-zA-Z0-9_-]+(\/[a-zA-Z0-9_-]+)*\/?$/).withMessage({ message: 'Invalid websiteUrl', field: "websiteUrl" });
exports.blogUrlMatchingValidation = blogUrlMatchingValidation;
const validationResultMiddleware = (req, res, next) => {
    const result = (0, express_validator_1.validationResult)(req);
    if (!result.isEmpty()) {
        return res.status(400).send({ errorsMessages: result.array({ onlyFirstError: true }).map(error => error.msg) });
    }
    return next();
};
exports.validationResultMiddleware = validationResultMiddleware;
