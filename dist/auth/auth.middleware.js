"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authValidationMiddleware = void 0;
const authValidationMiddleware = (req, res, next) => {
    if (req.headers.authorization !== 'Basic YWRtaW46cXdlcnR5') {
        return res.sendStatus(401);
    }
    return next();
};
exports.authValidationMiddleware = authValidationMiddleware;
// export const authValidationMiddleware = () => header('Authorization').custom((value, ) =>{
//     if(value !== 'Basic YWRtaW46cXdlcnR5'){
//         throw new Error('401')
//     }
//     return true
// })
