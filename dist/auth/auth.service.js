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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = void 0;
const db_init_1 = require("../blogs/db/db.init");
const bcrypt = __importStar(require("bcrypt"));
const nodemailer = __importStar(require("nodemailer"));
const date_fns_1 = require("date-fns");
const uuid4_1 = __importDefault(require("uuid4"));
const mongodb_1 = require("mongodb");
exports.authService = {
    checkCredentials(loginOrEmail, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const userNameOrEmail = yield db_init_1.client.db('incubator').collection('users').findOne({ $or: [{ login: loginOrEmail }, { email: loginOrEmail }] });
            if (userNameOrEmail) {
                return (yield (bcrypt.compare(password, userNameOrEmail.password))) ? userNameOrEmail : false;
            }
            else {
                return false;
            }
        });
    },
    sendMail(email, confirmationCode) {
        return __awaiter(this, void 0, void 0, function* () {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: "borisincubator@gmail.com",
                    pass: "fczspwlifurculqv",
                },
            });
            const info = yield transporter.sendMail({
                from: 'Boris <borisincubator@gmail.com>',
                to: email,
                subject: "Registration conformation ✔",
                html: `<p>To finish registration please follow the link below:<a href='https://somesite.com/confirm-email?code=${confirmationCode}'>complete registration</a></p>`, // html body
            });
            console.log(info);
        });
    },
    verifyUserByCode(code) {
        return __awaiter(this, void 0, void 0, function* () {
            const userToVerify = yield db_init_1.client.db('incubator').collection('users').findOne({ "emailConfirmation.confirmationCode": code });
            if (userToVerify && userToVerify.emailConfirmation.confirmationCode == code && (0, date_fns_1.compareAsc)(userToVerify.emailConfirmation.expirationDate, new Date()) && userToVerify.emailConfirmation.isConfirmed === false) {
                yield db_init_1.client.db('incubator').collection('users').updateOne(userToVerify, { $set: { 'emailConfirmation.isConfirmed': true } });
                return true;
            }
            else {
                return false;
            }
        });
    },
    resendEmailForRegistration(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const userToVerify = yield db_init_1.client.db('incubator').collection('users').findOne({ email });
            if (userToVerify && userToVerify.emailConfirmation.isConfirmed === false) {
                const newConfirmationCode = (0, uuid4_1.default)();
                yield db_init_1.client.db('incubator').collection('users').updateOne(userToVerify, { $set: { "emailConfirmation.confirmationCode": newConfirmationCode } });
                yield this.sendMail(email, newConfirmationCode);
                return true;
            }
            else {
                return false;
            }
        });
    },
    createNewSession(userId, ip, title, deviceId, expDate) {
        return __awaiter(this, void 0, void 0, function* () {
            const refreshTokenExpirationDate = (0, date_fns_1.add)(new Date(), { seconds: expDate }).toISOString();
            const lastActiveDate = Math.floor(+new Date() / 1000) * 1000;
            console.log(new Date(lastActiveDate).toISOString());
            yield db_init_1.client.db('incubator').collection('deviceSessions').insertOne({ userId, ip, title, lastActiveDate: new Date(lastActiveDate).toISOString(), deviceId, expiration: refreshTokenExpirationDate });
        });
    },
    isSessionValid(token) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(new Date(token.iat * 1000).toISOString());
            return yield db_init_1.client.db('incubator').collection('deviceSessions').findOne({ userId: new mongodb_1.ObjectId(token.userId), lastActiveDate: new Date(token.iat * 1000).toISOString() });
        });
    }
};
