"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDatabase = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = require("./env");
const logger_1 = require("../utils/logger");
const connectDatabase = async () => {
    try {
        await mongoose_1.default.connect(env_1.env.MONGODB_URI);
        logger_1.logger.info('MongoDB connected successfully');
    }
    catch (error) {
        logger_1.logger.error('MongoDB connection failed:', error);
        process.exit(1);
    }
    mongoose_1.default.connection.on('error', (err) => {
        logger_1.logger.error('MongoDB connection error:', err);
    });
    mongoose_1.default.connection.on('disconnected', () => {
        logger_1.logger.warn('MongoDB disconnected');
    });
};
exports.connectDatabase = connectDatabase;
//# sourceMappingURL=database.js.map