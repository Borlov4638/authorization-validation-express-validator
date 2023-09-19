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
exports.postsService = void 0;
const mongodb_1 = require("mongodb");
const db_init_1 = require("../blogs/db/db.init");
const like_status_enum_1 = require("../app/like-status.enum");
const posts_repository_1 = require("./posts.repository");
exports.postsService = {
    getPostById(postId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield db_init_1.client.db('incubator').collection('posts').findOne({ _id: new mongodb_1.ObjectId(postId) });
        });
    },
    changeLikeStatus(postToLike, user, likeStatus) {
        return __awaiter(this, void 0, void 0, function* () {
            const isPostLiked = posts_repository_1.postsRepository.getLikeStatus(postToLike, user);
            const likedPost = (isPostLiked === like_status_enum_1.LikeStatus.None) ? posts_repository_1.postsRepository.createLikeStatus(postToLike, user, likeStatus) : posts_repository_1.postsRepository.changeLikeStatus(postToLike, user, likeStatus);
            try {
                yield db_init_1.client.db('incubator').collection('posts').updateOne({ _id: new mongodb_1.ObjectId(postToLike.id) }, { $set: { extendedLikesInfo: likedPost.extendedLikesInfo } });
                return true;
            }
            catch (err) {
                console.log(err);
                return false;
            }
        });
    }
};
