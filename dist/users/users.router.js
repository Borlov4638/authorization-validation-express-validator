"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const db_init_1 = require("../blogs/db/db.init");
const users_repository_1 = require("./users.repository");
const bcript = __importStar(require("bcrypt"));
const express_validator_1 = require("express-validator");
const blog_validatiom_1 = require("../blogs/validation/blog.validatiom");
exports.usersRouter = (0, express_1.Router)({});
exports.usersRouter.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const searchLoginTerm = (req.query.searchLoginTerm) ? req.query.searchLoginTerm : '';
    const searchEmailTerm = (req.query.searchEmailTerm) ? req.query.searchEmailTerm : '';
    const sortBy = (req.query.sortBy) ? req.query.sortBy : "createdAt";
    const sortDirection = (req.query.sortDirection === "asc") ? 1 : -1;
    const sotringQuery = users_repository_1.usersRepository.usersSortingQuery(sortBy, sortDirection);
    const pageNumber = (req.query.pageNumber) ? +req.query.pageNumber : 1;
    const pageSize = (req.query.pageSize) ? +req.query.pageSize : 10;
    const itemsToSkip = (pageNumber - 1) * pageSize;
    //
    //FIX FIMD METHOD
    //
    const usersToSend = yield db_init_1.client.db("incubator").collection("users").find({ $or: [{ login: { $regex: searchLoginTerm } }, { email: { $regex: searchEmailTerm } }] }, { projection: { _id: 0, salt: 0, password: 0 } })
        .sort(sotringQuery)
        .skip(itemsToSkip)
        .limit(pageSize)
        .toArray();
    const totalCountOfItems = yield db_init_1.client.db("incubator").collection("users")
        .find({ $or: [{ login: { $regex: searchLoginTerm } }, { email: { $regex: searchEmailTerm } }] }).toArray();
    const mappedResponse = {
        pagesCount: Math.ceil(totalCountOfItems.length / pageSize),
        page: pageNumber,
        pageSize: pageSize,
        totalCount: totalCountOfItems.length,
        items: [...usersToSend]
    };
    res.status(200).send(mappedResponse);
}));
exports.usersRouter.post('/', (0, express_validator_1.body)('login').exists().withMessage({ message: "login is not passed", field: "login" }).isString().isLength({ min: 3, max: 10 }).matches(/^[a-zA-Z0-9_-]*$/).withMessage({ message: "invalid login", field: "login" }), (0, express_validator_1.body)('password').exists().withMessage({ message: "password is not passed", field: "password" }).isString().isLength({ min: 6, max: 20 }).withMessage({ message: "invalid password", field: "password" }), (0, express_validator_1.body)('email').exists().withMessage({ message: "email is not passed", field: "email" }).isString().matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/).withMessage({ message: "invalid email", field: "email" }), blog_validatiom_1.validationResultMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const salt = yield bcript.genSalt(10);
    const usersPassword = yield bcript.hash(req.body.password, salt);
    const newUser = {
        createdAt: new Date().toISOString(),
        login: req.body.login,
        password: usersPassword,
        email: req.body.email,
        salt
    };
    const insertedUser = yield db_init_1.client.db('incubator').collection('users').insertOne(newUser);
    yield db_init_1.client.db('incubator').collection('users').updateOne({ _id: insertedUser.insertedId }, { $set: { id: insertedUser.insertedId } });
    const userToReturn = yield db_init_1.client.db('incubator').collection('users').find({ _id: insertedUser.insertedId }, { projection: { _id: 0, salt: 0, password: 0 } }).toArray();
    res.status(201).send(userToReturn);
}));
