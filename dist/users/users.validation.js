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
exports.usersEmailValidation = exports.usersPasswordValidation = exports.usersLoginValidation = void 0;
const express_validator_1 = require("express-validator");
const db_init_1 = require("../blogs/db/db.init");
const usersLoginValidation = () => (0, express_validator_1.body)('login').exists().withMessage({ message: "login is not passed", field: "login" }).isString().isLength({ min: 3, max: 10 }).withMessage({ message: "invalid length of login", field: "login" }).matches(/^[a-zA-Z0-9_-]*$/).withMessage({ message: "invalid login", field: "login" });
exports.usersLoginValidation = usersLoginValidation;
const usersPasswordValidation = () => (0, express_validator_1.body)('password').exists().withMessage({ message: "password is not passed", field: "password" }).isString().isLength({ min: 6, max: 20 }).withMessage({ message: "invalid password", field: "password" });
exports.usersPasswordValidation = usersPasswordValidation;
const usersEmailValidation = () => (0, express_validator_1.body)('email').exists().withMessage({ message: "email is not passed", field: "email" }).isString().matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/).withMessage({ message: "invalid email", field: "email" })
    .custom((value, { req }) => __awaiter(void 0, void 0, void 0, function* () {
    const isEmailExists = yield db_init_1.client.db('incubator').collection('users').find({ email: req.body.email }).toArray();
    if (isEmailExists.length > 0) {
        throw new Error();
    }
    return true;
})).withMessage({ message: 'This email is alreaidy in use', field: "email" });
exports.usersEmailValidation = usersEmailValidation;
