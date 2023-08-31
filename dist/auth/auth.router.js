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
exports.authRouter = void 0;
const express_1 = require("express");
const auth_validation_1 = require("./auth.validation");
const blog_validatiom_1 = require("../blogs/validation/blog.validatiom");
const auth_service_1 = require("./auth.service");
const jwt_service_1 = require("../app/jwt.service");
const users_validation_1 = require("../users/users.validation");
exports.authRouter = (0, express_1.Router)({});
exports.authRouter.post('/login', (0, auth_validation_1.authLoginOrEmailValidation)(), (0, auth_validation_1.authPasswordValidation)(), blog_validatiom_1.validationResultMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userIsValid = yield auth_service_1.authService.checkCredentials(req.body.loginOrEmail, req.body.password);
    if (userIsValid) {
        const token = jwt_service_1.jwtService.createToken(userIsValid);
        res.status(200).send({ accessToken: token });
    }
    else {
        res.sendStatus(401);
    }
}));
exports.authRouter.get('/me', (req, res) => {
    if (req.headers.authorization) {
        const token = jwt_service_1.jwtService.getUserByToken(req.headers.authorization);
        return token ? res.status(201).send(token) : res.sendStatus(401);
    }
    return res.sendStatus(401);
});
exports.authRouter.post('/regisrtation', (0, users_validation_1.usersLoginValidation)(), (0, users_validation_1.usersEmailValidation)(), (0, users_validation_1.usersPasswordValidation)(), blog_validatiom_1.validationResultMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const subject = "Registration conformation ✔";
    const message = "<b>Confirm your registration</b>";
    auth_service_1.authService.sendMail(req.body.email, subject, message);
    res.sendStatus(204);
}));
