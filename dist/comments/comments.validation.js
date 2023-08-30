"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commentsContentValidation = void 0;
const express_validator_1 = require("express-validator");
const commentsContentValidation = () => (0, express_validator_1.body)('content').exists().withMessage({ message: 'Invalid content', field: "content" }).isString().isLength({ max: 300, min: 20 }).withMessage({ message: 'Invalid content', field: "content" });
exports.commentsContentValidation = commentsContentValidation;
