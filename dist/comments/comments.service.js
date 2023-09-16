"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commentService = void 0;
const comments_repo_1 = require("./comments.repo");
exports.commentService = {
    changeLikeStatus(user, commentToLike, likeStatus) {
        const usersLikeStatus = comments_repo_1.commentsRepository.checkLikeStatus(commentToLike, user);
        if (usersLikeStatus) {
            return comments_repo_1.commentsRepository.changeLikeStatus(commentToLike, user, likeStatus);
        }
        else {
            return comments_repo_1.commentsRepository.addLikeStatus(commentToLike, user, likeStatus);
        }
    }
};
