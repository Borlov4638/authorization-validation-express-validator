"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authLoginOrEmailValidation = exports.authPasswordValidation = void 0;
const express_validator_1 = require("express-validator");
const authPasswordValidation = () => (0, express_validator_1.body)('password').exists().withMessage({ message: "password is not passed", field: "password" }).isString().isLength({ min: 1 }).withMessage({ message: "password is invalid", field: "password" });
exports.authPasswordValidation = authPasswordValidation;
const authLoginOrEmailValidation = () => (0, express_validator_1.body)('loginOrEmail').exists().withMessage({ message: "login or email is not passed", field: "loginOrEmail" }).isString().isLength({ min: 1 }).withMessage({ message: "login or email is invalid", field: "loginOrEmail" });
exports.authLoginOrEmailValidation = authLoginOrEmailValidation;
