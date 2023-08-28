"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usersRepository = void 0;
exports.usersRepository = {
    usersSortingQuery(sortBy, sortDirection) {
        switch (sortBy) {
            case 'id':
                return { id: sortDirection };
            case 'login':
                return { login: sortDirection };
            case 'email':
                return { email: sortDirection };
            case 'createdAt':
                return { createdAt: sortDirection };
            default:
                return { createdAt: 1 };
        }
    }
};
