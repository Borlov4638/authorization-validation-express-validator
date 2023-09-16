"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.commentsRepository = void 0;
const like_status_enum_1 = require("../app/like-status.enum");
exports.commentsRepository = {
    checkLikeStatus(commentToLike, user) {
        if (commentToLike.likesInfo.usersWhoLiked.indexOf(user.userId) === -1 && commentToLike.likesInfo.usersWhoDisliked.indexOf(user.userId) === -1) {
            return false;
        }
        else {
            return true;
        }
    },
    removeLikeStatus(commentToLike, user) {
        const isDislikesIndex = commentToLike.likesInfo.usersWhoDisliked.indexOf(user.userId);
        const isLikesIndex = commentToLike.likesInfo.usersWhoLiked.indexOf(user.userId);
        if (isDislikesIndex !== -1) {
            commentToLike.likesInfo.usersWhoDisliked.splice(isDislikesIndex, 1);
        }
        else {
            commentToLike.likesInfo.usersWhoLiked.splice(isLikesIndex, 1);
        }
    },
    addLikeStatus(commentToLike, user, likeStatus) {
        switch (likeStatus) {
            case like_status_enum_1.LikeStatus.Dislike:
                commentToLike.likesInfo.usersWhoDisliked.push(user.userId);
                return commentToLike;
            case like_status_enum_1.LikeStatus.Like:
                commentToLike.likesInfo.usersWhoLiked.push(user.userId);
                return commentToLike;
            case like_status_enum_1.LikeStatus.None:
                return commentToLike;
        }
    },
    changeLikeStatus(commentToLike, user, likeStatus) {
        switch (likeStatus) {
            case like_status_enum_1.LikeStatus.Dislike:
                this.removeLikeStatus(commentToLike, user);
                this.addLikeStatus(commentToLike, user, likeStatus);
                return commentToLike;
            case like_status_enum_1.LikeStatus.Like:
                this.removeLikeStatus(commentToLike, user);
                this.addLikeStatus(commentToLike, user, likeStatus);
                return commentToLike;
            case like_status_enum_1.LikeStatus.None:
                this.removeLikeStatus(commentToLike, user);
                return commentToLike;
        }
    },
    getLikeStatus(commentToLike, user) {
        const isDislikesIndex = commentToLike.likesInfo.usersWhoDisliked.indexOf(user.userId);
        const isLikesIndex = commentToLike.likesInfo.usersWhoLiked.indexOf(user.userId);
        if (isDislikesIndex !== -1) {
            return like_status_enum_1.LikeStatus.Dislike;
        }
        else if (isLikesIndex !== -1) {
            return like_status_enum_1.LikeStatus.Like;
        }
        else {
            return like_status_enum_1.LikeStatus.None;
        }
    }
};
