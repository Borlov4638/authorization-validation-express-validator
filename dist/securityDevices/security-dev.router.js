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
exports.secDevRouter = void 0;
const express_1 = require("express");
const jwt_service_1 = require("../app/jwt.service");
const db_init_1 = require("../blogs/db/db.init");
const mongodb_1 = require("mongodb");
exports.secDevRouter = (0, express_1.Router)({});
exports.secDevRouter.get('/devices', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.cookies.refreshToken) {
        return res.sendStatus(401);
    }
    const token = jwt_service_1.jwtService.getAllTokenData(req.cookies.refreshToken);
    if (!token) {
        return res.sendStatus(401);
    }
    const usersSessions = yield db_init_1.client.db('incubator').collection('deviceSessions').find({ userId: new mongodb_1.ObjectId(token.userId) }, { projection: { _id: 0, userId: 0, expiration: 0 } }).toArray();
    return res.status(200).send(usersSessions);
}));
exports.secDevRouter.delete('/devices', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.cookies.refreshToken) {
        return res.sendStatus(401);
    }
    const token = jwt_service_1.jwtService.getAllTokenData(req.cookies.refreshToken);
    if (!token) {
        return res.sendStatus(401);
    }
    yield db_init_1.client.db('incubator').collection('deviceSessions').deleteMany({ userId: new mongodb_1.ObjectId(token.userId), deviceId: { $not: { $regex: token.deviceId } } });
    return res.sendStatus(204);
}));
exports.secDevRouter.delete('/devices/:deviceId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.cookies.refreshToken) {
        return res.sendStatus(401);
    }
    const token = jwt_service_1.jwtService.getAllTokenData(req.cookies.refreshToken);
    if (!token) {
        return res.sendStatus(401);
    }
    const deviceToDelete = yield db_init_1.client.db('incubator').collection('deviceSessions').findOne({ deviceId: req.params.deviceId });
    if (!deviceToDelete) {
        return res.sendStatus(404);
    }
    if (deviceToDelete.userId.toString() !== token.userId) {
        return res.sendStatus(403);
    }
    yield db_init_1.client.db('incubator').collection('deviceSessions').deleteOne(deviceToDelete);
    return res.sendStatus(204);
}));
