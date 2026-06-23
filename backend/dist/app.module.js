"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const throttler_1 = require("@nestjs/throttler");
const core_1 = require("@nestjs/core");
const bullmq_1 = require("@nestjs/bullmq");
const database_module_1 = require("./database/database.module");
const activity_module_1 = require("./modules/activity/activity.module");
const upload_module_1 = require("./modules/upload/upload.module");
const auth_module_1 = require("./modules/auth/auth.module");
const users_module_1 = require("./modules/users/users.module");
const students_module_1 = require("./modules/students/students.module");
const clients_module_1 = require("./modules/clients/clients.module");
const recruiters_module_1 = require("./modules/recruiters/recruiters.module");
const tpo_module_1 = require("./modules/tpo/tpo.module");
const admin_module_1 = require("./modules/admin/admin.module");
const projects_module_1 = require("./modules/projects/projects.module");
const applications_module_1 = require("./modules/applications/applications.module");
const contracts_module_1 = require("./modules/contracts/contracts.module");
const wallet_module_1 = require("./modules/wallet/wallet.module");
const reviews_module_1 = require("./modules/reviews/reviews.module");
const skills_module_1 = require("./modules/skills/skills.module");
const colleges_module_1 = require("./modules/colleges/colleges.module");
const recommendations_module_1 = require("./modules/recommendations/recommendations.module");
const leaderboard_module_1 = require("./modules/leaderboard/leaderboard.module");
const analytics_module_1 = require("./modules/analytics/analytics.module");
const notifications_module_1 = require("./modules/notifications/notifications.module");
const disputes_module_1 = require("./modules/disputes/disputes.module");
const messaging_module_1 = require("./modules/messaging/messaging.module");
const config_validation_1 = require("./config/config.validation");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: ['../.env', '.env'],
                validationSchema: config_validation_1.configValidationSchema,
                cache: true,
            }),
            throttler_1.ThrottlerModule.forRootAsync({
                inject: [config_1.ConfigService],
                useFactory: (cfg) => [
                    {
                        ttl: cfg.get('THROTTLE_TTL', 60000),
                        limit: cfg.get('THROTTLE_LIMIT', 100),
                    },
                ],
            }),
            bullmq_1.BullModule.forRootAsync({
                inject: [config_1.ConfigService],
                useFactory: (cfg) => ({
                    connection: {
                        host: cfg.get('REDIS_HOST', 'localhost'),
                        port: cfg.get('REDIS_PORT', 6379),
                        password: cfg.get('REDIS_PASSWORD', ''),
                    },
                    defaultJobOptions: {
                        removeOnComplete: 100,
                        removeOnFail: 50,
                        attempts: 3,
                        backoff: { type: 'exponential', delay: 1000 },
                    },
                }),
            }),
            database_module_1.DatabaseModule,
            activity_module_1.ActivityModule,
            upload_module_1.UploadModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            students_module_1.StudentsModule,
            clients_module_1.ClientsModule,
            recruiters_module_1.RecruitersModule,
            tpo_module_1.TpoModule,
            admin_module_1.AdminModule,
            projects_module_1.ProjectsModule,
            applications_module_1.ApplicationsModule,
            contracts_module_1.ContractsModule,
            wallet_module_1.WalletModule,
            reviews_module_1.ReviewsModule,
            skills_module_1.SkillsModule,
            colleges_module_1.CollegesModule,
            recommendations_module_1.RecommendationsModule,
            leaderboard_module_1.LeaderboardModule,
            analytics_module_1.AnalyticsModule,
            notifications_module_1.NotificationsModule,
            disputes_module_1.DisputesModule,
            messaging_module_1.MessagingModule,
        ],
        providers: [
            {
                provide: core_1.APP_GUARD,
                useClass: throttler_1.ThrottlerGuard,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map