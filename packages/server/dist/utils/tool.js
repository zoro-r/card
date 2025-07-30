"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.success = success;
exports.fail = fail;
exports.error = error;
function success(data, message = 'success') {
    return {
        code: 200,
        data,
        message,
    };
}
function fail(message = 'fail') {
    return {
        code: -1,
        message,
    };
}
function error(message = 'error', err) {
    return {
        code: -1,
        message,
        error: (err === null || err === void 0 ? void 0 : err.message) || err,
    };
}
