"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const config_1 = require("@nestjs/config");
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const app_module_1 = require("./app.module");
const http_exception_filter_1 = require("./common/filters/http-exception.filter");
const transform_interceptor_1 = require("./common/interceptors/transform.interceptor");
const logging_interceptor_1 = require("./common/interceptors/logging.interceptor");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, {
        logger: ['error', 'warn', 'log', 'debug', 'verbose'],
    });
    const configService = app.get(config_1.ConfigService);
    const port = configService.get('PORT', 3001);
    const nodeEnv = configService.get('NODE_ENV', 'development');
    const frontendUrl = configService.get('FRONTEND_URL', 'http://localhost:3000');
    app.use((0, helmet_1.default)({
        crossOriginEmbedderPolicy: false,
        contentSecurityPolicy: nodeEnv === 'production',
    }));
    app.use((0, compression_1.default)());
    app.enableCors({
        origin: [frontendUrl, 'http://localhost:3000'],
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
        credentials: true,
    });
    const apiPrefix = configService.get('API_PREFIX', 'api');
    app.setGlobalPrefix(apiPrefix);
    app.enableVersioning({ type: common_1.VersioningType.URI, defaultVersion: '1' });
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
    }));
    app.useGlobalFilters(new http_exception_filter_1.HttpExceptionFilter());
    app.useGlobalInterceptors(new logging_interceptor_1.LoggingInterceptor(), new transform_interceptor_1.TransformInterceptor());
    if (nodeEnv !== 'production') {
        const swaggerConfig = new swagger_1.DocumentBuilder()
            .setTitle('TalentMesh AI API')
            .setDescription('## TalentMesh AI - Talent Intelligence Platform API\n\n' +
            'A production-grade backend for the TalentMesh student freelance marketplace, ' +
            'featuring Reputation Scoring, Recommendation Engine, Escrow workflows, ' +
            'Leaderboards, and Analytics.\n\n' +
            '### Authentication\nUse the `/api/v1/auth/login` endpoint to get a JWT token, ' +
            'then click **Authorize** and enter `Bearer <token>`.')
            .setVersion('1.0.0')
            .setContact('TalentMesh Team', 'https://talentmesh.ai', 'support@talentmesh.ai')
            .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' }, 'JWT')
            .addTag('auth', 'Authentication & Authorization')
            .addTag('users', 'User Profile Management')
            .addTag('students', 'Student Profiles & Portfolio')
            .addTag('clients', 'Client Profiles & Projects')
            .addTag('recruiters', 'Recruiter Talent Discovery')
            .addTag('tpo', 'Training & Placement Officers')
            .addTag('admin', 'Platform Administration')
            .addTag('projects', 'Project Marketplace')
            .addTag('applications', 'Project Applications')
            .addTag('contracts', 'Contract & Escrow Workflow')
            .addTag('wallet', 'Wallet & Transactions')
            .addTag('reviews', 'Reviews & Ratings')
            .addTag('skills', 'Skills Management')
            .addTag('recommendations', 'AI Recommendation Engine')
            .addTag('leaderboard', 'Leaderboard Rankings')
            .addTag('analytics', 'Analytics & Reporting')
            .addTag('notifications', 'Notifications')
            .addTag('disputes', 'Dispute Resolution')
            .build();
        const document = swagger_1.SwaggerModule.createDocument(app, swaggerConfig);
        swagger_1.SwaggerModule.setup(`${apiPrefix}/docs`, app, document, {
            swaggerOptions: {
                persistAuthorization: true,
                tagsSorter: 'alpha',
                operationsSorter: 'alpha',
            },
        });
        console.log(`\n📖 Swagger Docs → http://localhost:${port}/${apiPrefix}/docs`);
    }
    await app.listen(port);
    console.log(`\n🚀 TalentMesh API running on http://localhost:${port}/${apiPrefix}/v1`);
    console.log(`🌍 Environment: ${nodeEnv}`);
}
bootstrap();
//# sourceMappingURL=main.js.map