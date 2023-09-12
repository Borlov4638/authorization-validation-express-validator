"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlogsModel = void 0;
const mongodb_1 = require("mongodb");
const mongoose_1 = __importDefault(require("mongoose"));
const blogsScheme = new mongoose_1.default.Schema({
    name: { type: String, required: true },
    createdAt: { type: String, required: true },
    description: { type: String, required: true },
    id: { type: mongodb_1.ObjectId },
    isMembership: Boolean,
    websiteUrl: { type: String, required: true }
});
exports.BlogsModel = mongoose_1.default.model('blogs', blogsScheme);
