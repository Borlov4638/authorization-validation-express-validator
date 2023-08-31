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
exports.usersService = void 0;
const mongodb_1 = require("mongodb");
const password_service_1 = require("../app/password.service");
const db_init_1 = require("../blogs/db/db.init");
const users_repository_1 = require("./users.repository");
exports.usersService = {
    getUsersWithPaganation(pageNumber, pageSize, searchEmailTerm, searchLoginTerm, sortBy, sortDirection) {
        return __awaiter(this, void 0, void 0, function* () {
            searchLoginTerm = (searchLoginTerm) ? searchLoginTerm : '';
            searchEmailTerm = (searchEmailTerm) ? searchEmailTerm : '';
            sortBy = (sortBy) ? sortBy : "createdAt";
            sortDirection = (sortDirection === "asc") ? 1 : -1;
            const sotringQuery = users_repository_1.usersRepository.usersSortingQuery(sortBy, sortDirection);
            pageNumber = (pageNumber) ? +pageNumber : 1;
            pageSize = (pageSize) ? +pageSize : 10;
            const itemsToSkip = (pageNumber - 1) * pageSize;
            const usersToSend = yield db_init_1.client.db("incubator").collection("users")
                .find({ $or: [{ login: { $regex: searchLoginTerm, $options: 'i' } }, { email: { $regex: searchEmailTerm, $options: 'i' } }] }, { projection: { _id: 0, password: 0 } })
                .sort(sotringQuery)
                .skip(itemsToSkip)
                .limit(pageSize)
                .toArray();
            const totalCountOfItems = yield db_init_1.client.db("incubator").collection("users")
                .find({ $or: [{ login: { $regex: searchLoginTerm, $options: 'i' } }, { email: { $regex: searchEmailTerm, $options: 'i' } }] }).toArray();
            const mappedResponse = {
                pagesCount: Math.ceil(totalCountOfItems.length / pageSize),
                page: pageNumber,
                pageSize: pageSize,
                totalCount: totalCountOfItems.length,
                items: [...usersToSend]
            };
            return mappedResponse;
        });
    },
    createNewUser(login, password, email) {
        return __awaiter(this, void 0, void 0, function* () {
            const usersPassword = yield password_service_1.passwordService.hashPassword(password);
            const newUser = {
                createdAt: new Date().toISOString(),
                login,
                password: usersPassword,
                email,
            };
            const insertedUser = yield db_init_1.client.db('incubator').collection('users').insertOne(newUser);
            yield db_init_1.client.db('incubator').collection('users').updateOne({ _id: insertedUser.insertedId }, { $set: { id: insertedUser.insertedId } });
            const userToReturn = yield db_init_1.client.db('incubator').collection('users').findOne({ _id: insertedUser.insertedId }, { projection: { _id: 0, password: 0 } });
            return userToReturn;
        });
    },
    deleteUser(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const userTodelete = yield db_init_1.client.db('incubator').collection('users').deleteOne({ _id: new mongodb_1.ObjectId(userId) });
            if (userTodelete.deletedCount < 1) {
                return false;
            }
            else {
                return true;
            }
        });
    }
};
