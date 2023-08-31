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
exports.usersRouter = void 0;
const express_1 = require("express");
const blog_validatiom_1 = require("../blogs/validation/blog.validatiom");
const users_validation_1 = require("./users.validation");
const auth_middleware_1 = require("../auth/auth.middleware");
const users_service_1 = require("./users.service");
exports.usersRouter = (0, express_1.Router)({});
exports.usersRouter.get('/', auth_middleware_1.authValidationMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const usersList = yield users_service_1.usersService.getUsersWithPaganation(req.query.pageNumber, req.query.pageSize, req.query.searchEmailTerm, req.query.searchLoginTerm, req.query.sortBy, req.query.sortDirection);
    res.status(200).send(usersList);
}));
exports.usersRouter.post('/', auth_middleware_1.authValidationMiddleware, (0, users_validation_1.usersLoginValidation)(), (0, users_validation_1.usersEmailValidation)(), (0, users_validation_1.usersPasswordValidation)(), blog_validatiom_1.validationResultMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const createdUser = yield users_service_1.usersService.createNewUser(req.body.login, req.body.password, req.body.email);
    res.status(201).send(createdUser);
}));
exports.usersRouter.delete('/:id', auth_middleware_1.authValidationMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userIsDeleted = yield users_service_1.usersService.deleteUser(req.params.id);
    if (userIsDeleted) {
        return res.sendStatus(204);
    }
    else {
        return res.sendStatus(404);
    }
}));
