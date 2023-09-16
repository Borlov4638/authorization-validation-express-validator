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
exports.commentService = void 0;
const like_status_enum_1 = require("../app/like-status.enum");
const jwt_service_1 = require("../app/jwt.service");
const comments_repo_1 = require("./comments.repo");
const db_init_1 = require("../blogs/db/db.init");
const mongodb_1 = require("mongodb");
exports.commentService = {
    changeLikeStatus(user, commentToLike, likeStatus) {
        const usersLikeStatus = comments_repo_1.commentsRepository.checkLikeStatus(commentToLike, user);
        if (usersLikeStatus) {
            return comments_repo_1.commentsRepository.changeLikeStatus(commentToLike, user, likeStatus);
        }
        else {
            return comments_repo_1.commentsRepository.addLikeStatus(commentToLike, user, likeStatus);
        }
    },
    getCommentById(commentId, token) {
        return __awaiter(this, void 0, void 0, function* () {
            const findedComment = yield db_init_1.client.db('incubator').collection('comments').findOne({ _id: new mongodb_1.ObjectId(commentId) }, { projection: { _id: 0, postId: 0 } });
            if (!findedComment) {
                return false;
            }
            let myStatus = like_status_enum_1.LikeStatus.None;
            if (token) {
                const user = jwt_service_1.jwtService.getAllTokenData(token);
                if (user) {
                    myStatus = comments_repo_1.commentsRepository.getLikeStatus(findedComment, user);
                }
            }
            const likesCount = findedComment.likesInfo.usersWhoLiked.length;
            const dislikesCount = findedComment.likesInfo.usersWhoDisliked.length;
            return Object.assign(Object.assign({}, findedComment), { likesInfo: { likesCount, dislikesCount, myStatus } });
        });
    }
};
