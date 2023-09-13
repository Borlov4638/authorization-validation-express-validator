"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRecoveryCodeValidation = exports.authNewPasswordValidation = exports.authLoginOrEmailValidation = exports.authPasswordValidation = void 0;
const express_validator_1 = require("express-validator");
const jwt_service_1 = require("../app/jwt.service");
const authPasswordValidation = () => (0, express_validator_1.body)('password').exists().withMessage({ message: "password is not passed", field: "password" }).isString().isLength({ min: 1 }).withMessage({ message: "password is invalid", field: "password" });
exports.authPasswordValidation = authPasswordValidation;
const authLoginOrEmailValidation = () => (0, express_validator_1.body)('loginOrEmail').exists().withMessage({ message: "login or email is not passed", field: "loginOrEmail" }).isString().isLength({ min: 1 }).withMessage({ message: "login or email is invalid", field: "loginOrEmail" });
exports.authLoginOrEmailValidation = authLoginOrEmailValidation;
const authNewPasswordValidation = () => (0, express_validator_1.body)('newPassword').exists().withMessage({ message: "password is not passed", field: "newPassword" }).isString().isLength({ min: 6, max: 20 }).withMessage({ message: "password is invalid", field: "newPassword" });
exports.authNewPasswordValidation = authNewPasswordValidation;
const authRecoveryCodeValidation = () => (0, express_validator_1.body)('recoveryCode').exists().withMessage({ message: "recoveryCode is not passed", field: "recoveryCode" }).isString().isLength({ min: 1 }).withMessage({ message: "code must be a string", field: "recoveryCode" })
    .custom((value, { req }) => {
    const isCodeValid = jwt_service_1.jwtService.getAllTokenData(req.body.recoveryCode);
    if (!isCodeValid) {
        throw new Error();
    }
    return true;
}).withMessage({ message: "recoveryCode is invalid", field: "recoveryCode" });
exports.authRecoveryCodeValidation = authRecoveryCodeValidation;
