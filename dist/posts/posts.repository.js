"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postsRepository = void 0;
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
    }
};
