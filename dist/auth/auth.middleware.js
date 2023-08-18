"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authValidationMiddleware = void 0;
const express_validator_1 = require("express-validator");
const authValidationMiddleware = () => (0, express_validator_1.header)('Authorization').custom((value) => {
    if (value !== 'Basic YWRtaW46cXdlcnR5') {
        throw new Error('401');
    }
    return true;
});
exports.authValidationMiddleware = authValidationMiddleware;
