"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireRole = exports.authenticate = void 0;
const token_1 = require("../utils/token");
const errorHandler_1 = require("./errorHandler");
const authenticate = (req, _res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(new errorHandler_1.AppError('Unauthorized: Missing or invalid authorization token', 401));
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = (0, token_1.verifyToken)(token);
        req.user = decoded;
        next();
    }
    catch (err) {
        return next(new errorHandler_1.AppError('Unauthorized: Invalid or expired token', 401));
    }
};
exports.authenticate = authenticate;
const requireRole = (...allowedRoles) => {
    return (req, _res, next) => {
        if (!req.user) {
            return next(new errorHandler_1.AppError('Unauthorized', 401));
        }
        if (!allowedRoles.includes(req.user.role)) {
            return next(new errorHandler_1.AppError('Forbidden: Insufficient privileges', 403));
        }
        next();
    };
};
exports.requireRole = requireRole;
