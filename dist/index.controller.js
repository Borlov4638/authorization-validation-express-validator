"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const blogs_router_1 = require("./blogs/blogs.roter/blogs.router");
const blogs_db_1 = require("./blogs/db/blogs.db");
const posts_router_1 = require("./posts/posts.router/posts.router");
const posts_db_1 = require("./posts/db/posts.db");
exports.app = (0, express_1.default)();
exports.app.use(express_1.default.json());
exports.app.use('/blogs', blogs_router_1.blogsRouter);
exports.app.use('/posts', posts_router_1.postRouter);
exports.app.delete('/testing/all-data', (req, res) => {
    blogs_db_1.blogsDB.splice(0, blogs_db_1.blogsDB.length);
    posts_db_1.postsDB.splice(0, posts_db_1.postsDB.length);
    res.sendStatus(204);
});
