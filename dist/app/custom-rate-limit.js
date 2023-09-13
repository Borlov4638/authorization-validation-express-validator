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
exports.customRateLimit = void 0;
const db_init_1 = require("../blogs/db/db.init");
const date_fns_1 = require("date-fns");
exports.customRateLimit = ((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const requestIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    yield db_init_1.client.db('incubator').collection('apiRequests').insertOne({ IP: requestIp, URL: req.originalUrl, date: new Date() });
    const reqCount = yield db_init_1.client.db('incubator').collection('apiRequests').find({ date: { $gte: (0, date_fns_1.sub)(new Date(), { seconds: 10 }) } }).toArray();
    const loginCount = reqCount.filter(req => req.URL === "/auth/login");
    const registrationConfirmationCount = reqCount.filter(req => req.URL === "/auth/registration-confirmation");
    const registrationCount = reqCount.filter(req => req.URL === "/auth/registration");
    const registrationEmailResCount = reqCount.filter(req => req.URL === "/auth/registration-email-resending");
    const newPasswordCount = reqCount.filter(req => req.URL === "/auth/new-password");
    const passwordRecoweryCount = reqCount.filter(req => req.URL === "/auth/password-recovery");
    if (loginCount.length > 5 || registrationConfirmationCount.length > 5 || registrationCount.length > 5 || registrationEmailResCount.length > 5 || newPasswordCount.length > 5, passwordRecoweryCount.length > 5) {
        return res.sendStatus(429);
    }
    console.log(reqCount.length);
    return next();
}));
