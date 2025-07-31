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
exports.Menu = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const uuid_1 = require("uuid");
const menuSchema = new mongoose_1.Schema({
    uuid: {
        type: String,
        default: uuid_1.v4,
    },
    name: {
        type: String,
        required: true,
    },
    path: {
        type: String,
    },
    component: {
        type: String,
    },
    icon: {
        type: String,
    },
    parentId: {
        type: String,
        default: null,
    },
    type: {
        type: String,
        enum: ['menu', 'button'],
        default: 'menu',
    },
    permission: {
        type: String,
    },
    sort: {
        type: Number,
        default: 0,
    },
    status: {
        type: String,
        enum: ['active', 'disabled'],
        default: 'active',
    },
    platformId: {
        type: String,
        required: true,
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
menuSchema.index({ uuid: 1 }, { unique: true });
menuSchema.index({ parentId: 1 });
menuSchema.index({ platformId: 1 });
menuSchema.index({ permission: 1 });
exports.Menu = mongoose_1.default.model('Menu', menuSchema);
