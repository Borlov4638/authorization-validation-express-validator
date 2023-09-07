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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const auth_validation_1 = require("./auth.validation");
const blog_validatiom_1 = require("../blogs/validation/blog.validatiom");
const auth_service_1 = require("./auth.service");
const jwt_service_1 = require("../app/jwt.service");
const users_validation_1 = require("../users/users.validation");
const users_service_1 = require("../users/users.service");
const express_validator_1 = require("express-validator");
const db_init_1 = require("../blogs/db/db.init");
const uuid4_1 = __importDefault(require("uuid4"));
const date_fns_1 = require("date-fns");
exports.authRouter = (0, express_1.Router)({});
exports.authRouter.post('/login', (0, auth_validation_1.authLoginOrEmailValidation)(), (0, auth_validation_1.authPasswordValidation)(), blog_validatiom_1.validationResultMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userIsValid = yield auth_service_1.authService.checkCredentials(req.body.loginOrEmail, req.body.password);
    if (userIsValid) {
        const requestIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const userAgent = (req.headers["user-agent"]) ? req.headers["user-agent"] : 'Chrome 105';
        const deviceId = (0, uuid4_1.default)();
        const refreshTokenExpirationDate = 20;
        const accessToken = jwt_service_1.jwtService.createAccessToken(userIsValid, 10);
        const refreshToken = jwt_service_1.jwtService.createRefreshToken(userIsValid, deviceId, refreshTokenExpirationDate);
        yield auth_service_1.authService.createNewSession(userIsValid.id, requestIp, userAgent, deviceId, refreshTokenExpirationDate);
        res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true });
        res.status(200).send({ accessToken });
    }
    else {
        res.sendStatus(401);
    }
}));
exports.authRouter.get('/me', (req, res) => {
    if (req.headers.authorization) {
        const token = jwt_service_1.jwtService.getUserByToken(req.headers.authorization);
        return token ? res.status(200).send(token) : res.sendStatus(401);
    }
    return res.sendStatus(401);
});
exports.authRouter.post('/registration', (0, users_validation_1.usersLoginValidation)(), (0, users_validation_1.usersEmailValidation)(), (0, users_validation_1.usersPasswordValidation)(), blog_validatiom_1.validationResultMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const subject = "Registration conformation ✔";
    const conformationCode = yield users_service_1.usersService.createNewUser(req.body.login, req.body.password, req.body.email, false);
    yield auth_service_1.authService.sendMail(req.body.email, conformationCode);
    res.sendStatus(204);
}));
exports.authRouter.post('/registration-confirmation', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const confirmation = yield auth_service_1.authService.verifyUserByCode(req.body.code);
    if (!confirmation) {
        return res.status(400).send({
            "errorsMessages": [
                {
                    "message": "confirmation code is incorrect, expired or already been applied",
                    "field": "code"
                }
            ]
        });
    }
    else {
        return res.sendStatus(204);
    }
}));
exports.authRouter.post('/registration-email-resending', (0, express_validator_1.body)('email').exists().withMessage({ message: "invalid email", field: "email" }).isString().matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/).withMessage({ message: "invalid email", field: "email" }), blog_validatiom_1.validationResultMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const emailIsResend = yield auth_service_1.authService.resendEmailForRegistration(req.body.email);
    if (emailIsResend) {
        return res.sendStatus(204);
    }
    else {
        return res.status(400).send({
            "errorsMessages": [
                {
                    "message": "email is already confirmed",
                    "field": "email"
                }
            ]
        });
    }
}));
exports.authRouter.post('/refresh-token', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.cookies.refreshToken) {
            return res.sendStatus(401);
        }
        const token = jwt_service_1.jwtService.getAllTokenData(req.cookies.refreshToken);
        if (token) {
            const isSessionValid = yield auth_service_1.authService.isSessionValid(token);
            console.log(isSessionValid);
            if (!isSessionValid) {
                return res.sendStatus(401);
            }
            token.id = token.userId;
            const accessToken = jwt_service_1.jwtService.createAccessToken(token, 10);
            const refreshToken = jwt_service_1.jwtService.createRefreshToken(token, token.deviceId, 20);
            const requestIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
            const userAgent = (req.headers["user-agent"]) ? req.headers["user-agent"] : 'Chrome 105';
            const refreshTokenExpirationDate = 20;
            yield db_init_1.client.db('incubator').collection('deviceSessions').findOneAndUpdate({ deviceId: isSessionValid.deviceId }, { $set: Object.assign(Object.assign({}, isSessionValid), { ip: requestIp, title: userAgent, lastActiveDate: (0, date_fns_1.format)(new Date(), 'yyyy-MM-dd-hh-mm-ss'), expiration: (0, date_fns_1.add)(new Date(), { seconds: refreshTokenExpirationDate }).toISOString() }) });
            res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true });
            return res.status(200).send({ accessToken });
        }
        else {
            return res.sendStatus(401);
        }
    }
    catch (err) {
        console.log(err);
        return res.status(400);
    }
}));
exports.authRouter.post('/logout', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.cookies.refreshToken) {
        return res.sendStatus(401);
    }
    const token = jwt_service_1.jwtService.getAllTokenData(req.cookies.refreshToken);
    if (!token) {
        return res.sendStatus(401);
    }
    const isSessionValid = yield auth_service_1.authService.isSessionValid(token);
    if (!isSessionValid) {
        return res.sendStatus(401);
    }
    console.log(isSessionValid);
    yield db_init_1.client.db('incubator').collection('deviceSessions').deleteOne(isSessionValid);
    return res.sendStatus(204);
}));
