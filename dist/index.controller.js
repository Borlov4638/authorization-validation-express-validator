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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const blogs_router_1 = require("./blogs/blogs.roter/blogs.router");
const posts_router_1 = require("./posts/posts.router/posts.router");
const db_init_1 = require("./blogs/db/db.init");
const users_router_1 = require("./users/users.router");
const auth_router_1 = require("./auth/auth.router");
const comments_router_1 = require("./comments/comments.router");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const security_dev_router_1 = require("./securityDevices/security-dev.router");
const custom_rate_limit_1 = require("./app/custom-rate-limit");
exports.app = (0, express_1.default)();
exports.app.use(express_1.default.json());
exports.app.use((0, cookie_parser_1.default)());
exports.app.use(custom_rate_limit_1.customRateLimit);
exports.app.use('/blogs', blogs_router_1.blogsRouter);
exports.app.use('/posts', posts_router_1.postRouter);
exports.app.use('/users', users_router_1.usersRouter);
exports.app.use('/auth', auth_router_1.authRouter);
exports.app.use('/comments', comments_router_1.commentsRouter);
exports.app.use('/security', security_dev_router_1.secDevRouter);
exports.app.delete('/testing/all-data', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield db_init_1.client.db("incubator").collection("blogs").deleteMany({});
    yield db_init_1.client.db("incubator").collection("posts").deleteMany({});
    yield db_init_1.client.db("incubator").collection("users").deleteMany({});
    yield db_init_1.client.db("incubator").collection("comments").deleteMany({});
    yield db_init_1.client.db('incubator').collection('deviceSessions').deleteMany({});
    yield db_init_1.client.db('incubator').collection('apiRequests').deleteMany({});
    res.sendStatus(204);
}));
exports.app.delete('/testing/blogs', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield db_init_1.client.db("incubator").collection("blogs").deleteMany({});
    res.sendStatus(204);
}));
