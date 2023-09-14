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
exports.blogsDbRepo = exports.BlogsModel = void 0;
const mongodb_1 = require("mongodb");
const mongoose_1 = __importDefault(require("mongoose"));
const blogsScheme = new mongoose_1.default.Schema({
    _id: { type: mongodb_1.ObjectId },
    name: { type: String, required: true },
    createdAt: { type: String, required: true },
    description: { type: String, required: true },
    id: { type: mongodb_1.ObjectId },
    isMembership: Boolean,
    websiteUrl: { type: String, required: true }
});
exports.BlogsModel = mongoose_1.default.model('blogs', blogsScheme);
exports.blogsDbRepo = {
    createNewBlog(newblog) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield exports.BlogsModel.create(newblog);
                const blogToReturn = exports.BlogsModel.find({ _id: newblog._id }).select({ _id: 0, __v: 0 }).lean();
                return blogToReturn;
            }
            catch (err) {
                console.log(err);
                return null;
            }
        });
    }
};
