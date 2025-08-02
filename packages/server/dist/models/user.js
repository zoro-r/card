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
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminUser = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const uuid_1 = require("uuid");
const adminUserSchema = new mongoose_1.Schema({
    uuid: {
        type: String,
        default: uuid_1.v4,
    },
    loginName: {
        type: String,
        required: true,
    },
    nickname: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        unique: true,
        sparse: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    avatar: {
        type: String,
    },
    platformId: {
        type: String,
        required: true,
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other'],
        default: 'other',
    },
    birthday: {
        type: String,
    },
    address: {
        type: String,
    },
    remark: {
        type: String,
    },
    status: {
        type: String,
        enum: ['active', 'disabled', 'pending', 'banned'],
        default: 'active',
    },
    password: {
        type: String,
        required: true,
    },
    isFirstLogin: {
        type: Boolean,
        default: true,
    },
    lastLoginAt: {
        type: Date,
    },
    lastLoginIp: {
        type: String,
    },
    createdBy: {
        type: String,
        default: 'system',
    },
    updatedBy: {
        type: String,
        default: 'system',
    },
}, {
    timestamps: true,
});
adminUserSchema.index({ uuid: 1 }, { unique: true });
adminUserSchema.index({ platformId: 1 });
adminUserSchema.index({ platformId: 1, status: 1 });
adminUserSchema.index({ email: 1, platformId: 1 });
exports.AdminUser = mongoose_1.default.model('AdminUser', adminUserSchema);
