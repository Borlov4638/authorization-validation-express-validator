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
exports.commentsRouter = void 0;
const express_1 = require("express");
const comments_validation_1 = require("./comments.validation");
const jwt_service_1 = require("../app/jwt.service");
const blog_validatiom_1 = require("../blogs/validation/blog.validatiom");
const db_init_1 = require("../blogs/db/db.init");
const mongodb_1 = require("mongodb");
const auth_middleware_1 = require("../auth/auth.middleware");
const like_status_enum_1 = require("../app/like-status.enum");
const comments_service_1 = require("./comments.service");
exports.commentsRouter = (0, express_1.Router)({});
exports.commentsRouter.put('/:commentId', auth_middleware_1.bearerAuthorization, (0, comments_validation_1.commentsContentValidation)(), blog_validatiom_1.validationResultMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const isAuthorized = jwt_service_1.jwtService.getUserByToken(req.headers.authorization);
    const commentToUpdate = yield db_init_1.client.db('incubator').collection('comments').findOne({ _id: new mongodb_1.ObjectId(req.params.commentId) });
    if (!commentToUpdate) {
        return res.sendStatus(404);
    }
    if (isAuthorized.userId !== commentToUpdate.commentatorInfo.userId) {
        return res.sendStatus(403);
    }
    yield db_init_1.client.db('incubator').collection('comments').updateOne(commentToUpdate, { $set: { content: req.body.content } });
    return res.sendStatus(204);
}));
exports.commentsRouter.get('/:commentId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const commentToShow = yield comments_service_1.commentService.getCommentById(req.params.commentId, req.headers.authorization);
    if (!commentToShow) {
        return res.sendStatus(404);
    }
    return res.status(200).send(commentToShow);
}));
exports.commentsRouter.delete('/:commentId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.headers.authorization) {
        return res.sendStatus(401);
    }
    const isAuthorized = jwt_service_1.jwtService.getUserByToken(req.headers.authorization);
    if (!isAuthorized) {
        return res.sendStatus(401);
    }
    const commentToDelete = yield db_init_1.client.db('incubator').collection('comments').findOne({ _id: new mongodb_1.ObjectId(req.params.commentId) });
    if (!commentToDelete) {
        return res.sendStatus(404);
    }
    if (isAuthorized.userId !== commentToDelete.commentatorInfo.userId) {
        return res.sendStatus(403);
    }
    yield db_init_1.client.db('incubator').collection('comments').deleteOne(commentToDelete);
    return res.sendStatus(204);
}));
exports.commentsRouter.put('/:commentId/like-status', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.headers.authorization) {
        return res.sendStatus(401);
    }
    const user = jwt_service_1.jwtService.getAllTokenData(req.headers.authorization);
    if (!user) {
        return res.sendStatus(401);
    }
    const commentToLike = yield db_init_1.client.db('incubator').collection('comments').findOne({ _id: new mongodb_1.ObjectId(req.params.commentId) });
    if (!commentToLike) {
        return res.sendStatus(404);
    }
    const likeStatuses = Object.values(like_status_enum_1.LikeStatus);
    if (!likeStatuses.includes(req.body.likeStatus)) {
        return res.status(400).send({ errorsMessages: [
                {
                    message: "invalid like status",
                    field: "likeStatus"
                }
            ] });
    }
    // console.log(commentService.changeLikeStatus(user as jwtUser, commentToLike as CommentType, req.body.likeStatus))
    const updatedLikeCount = comments_service_1.commentService.changeLikeStatus(user, commentToLike, req.body.likeStatus);
    yield db_init_1.client.db("incubator").collection("comments").updateOne({ _id: commentToLike._id }, { $set: { likesInfo: updatedLikeCount.likesInfo } });
    return res.sendStatus(204);
}));
