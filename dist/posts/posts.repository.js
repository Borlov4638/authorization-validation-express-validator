"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postsRepository = void 0;
const like_status_enum_1 = require("../app/like-status.enum");
exports.postsRepository = {
    commentsSortingQuery(sortBy, sortDirection) {
        switch (sortBy) {
            case "id":
                return { id: sortDirection };
            case "content":
                return { content: sortDirection };
            case "createdAt":
                return { createdAt: sortDirection };
            default:
                return { createdAt: 1 };
        }
    },
    getLikeStatus(postToLike, user) {
        if (postToLike.extendedLikesInfo.usersWhoLiked.map(obj => obj.userId).indexOf(user.userId)) {
            return like_status_enum_1.LikeStatus.Like;
        }
        else if (postToLike.extendedLikesInfo.usersWhoDisliked.indexOf(user.userId)) {
            return like_status_enum_1.LikeStatus.Dislike;
        }
        else {
            return like_status_enum_1.LikeStatus.None;
        }
    },
    clearLikeStatus(postToLike, user) {
        const isLikeIndex = postToLike.extendedLikesInfo.usersWhoLiked.map(obj => obj.userId).indexOf(user.userId);
        const isDislikeIndex = postToLike.extendedLikesInfo.usersWhoDisliked.indexOf(user.userId);
        if (isLikeIndex > -1) {
            postToLike.extendedLikesInfo.usersWhoLiked.splice(isLikeIndex, 1);
        }
        else {
            postToLike.extendedLikesInfo.usersWhoDisliked.splice(isDislikeIndex, 1);
        }
    },
    createLikeStatus(postToLike, user, likeStatus) {
        if (likeStatus === like_status_enum_1.LikeStatus.Like) {
            postToLike.extendedLikesInfo.usersWhoLiked.push({ userId: user.userId, login: user.login, addedAt: new Date().toISOString() });
        }
        else if (likeStatus === like_status_enum_1.LikeStatus.Dislike) {
            postToLike.extendedLikesInfo.usersWhoDisliked.push(user.userId);
        }
        return postToLike;
    },
    changeLikeStatus(postToLike, user, likeStatus) {
        this.clearLikeStatus(postToLike, user);
        return this.createLikeStatus(postToLike, user, likeStatus);
    }
};
