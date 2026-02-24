"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const env_1 = require("./config/env");
const database_1 = require("./config/database");
const swagger_1 = require("./config/swagger");
const logger_1 = require("./utils/logger");
const error_middleware_1 = require("./middlewares/error.middleware");
const routes_1 = __importDefault(require("./routes"));
const app = (0, express_1.default)();
// Security
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: env_1.env.CORS_ORIGIN,
    credentials: true,
}));
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: parseInt(env_1.env.RATE_LIMIT_WINDOW_MS),
    max: parseInt(env_1.env.RATE_LIMIT_MAX),
    message: {
        success: false,
        error: {
            code: 'RATE_LIMIT',
            message: 'Too many requests, please try again later.',
        },
    },
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);
// Body parsing
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
// HTTP request logging
app.use((0, morgan_1.default)('dev', {
    stream: { write: (message) => logger_1.logger.http(message.trim()) },
}));
// API Documentation
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.swaggerSpec, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Medication Tracker API Docs',
}));
// Health check
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// API routes
app.use('/api', routes_1.default);
// Error handling
app.use(error_middleware_1.notFoundHandler);
app.use(error_middleware_1.errorHandler);
const startServer = async () => {
    await (0, database_1.connectDatabase)();
    const PORT = parseInt(env_1.env.PORT);
    app.listen(PORT, () => {
        logger_1.logger.info(`Server running on http://localhost:${PORT}`);
        logger_1.logger.info(`API Docs available at http://localhost:${PORT}/api-docs`);
        logger_1.logger.info(`Environment: ${env_1.env.NODE_ENV}`);
    });
};
startServer().catch((error) => {
    logger_1.logger.error('Failed to start server:', error);
    process.exit(1);
});
exports.default = app;
//# sourceMappingURL=server.js.map