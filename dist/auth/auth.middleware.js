"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authPasswordValidationMiddleware = exports.authLoginValidationMiddleware = void 0;
const express_validator_1 = require("express-validator");
const authLoginValidationMiddleware = () => (0, express_validator_1.header)('login').custom((value) => {
    if (value !== 'admin') {
        throw new Error('401');
    }
    return true;
});
exports.authLoginValidationMiddleware = authLoginValidationMiddleware;
const authPasswordValidationMiddleware = () => (0, express_validator_1.header)('password').custom((value, { req }) => {
    if (value !== 'qwerty') {
        throw new Error('401');
    }
    return true;
});
exports.authPasswordValidationMiddleware = authPasswordValidationMiddleware;
