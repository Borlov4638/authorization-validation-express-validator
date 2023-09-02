"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.jwtService = void 0;
const jwt = __importStar(require("jsonwebtoken"));
const SECRET_KEY = 'myverysecretkey';
exports.jwtService = {
    createToken(user, expireTime) {
        return jwt.sign({ userId: user.id, email: user.email, login: user.login }, SECRET_KEY, { expiresIn: expireTime });
    },
    getUserByToken(token) {
        token = token.replace('Bearer', '').trim();
        try {
            const verifiedToken = jwt.verify(token, SECRET_KEY);
            if (verifiedToken) {
                delete verifiedToken.exp;
                delete verifiedToken.iat;
                delete verifiedToken.userId;
                return verifiedToken;
            }
            else {
                return null;
            }
        }
        catch (err) {
            return null;
        }
    }
};
