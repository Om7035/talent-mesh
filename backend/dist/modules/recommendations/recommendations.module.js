"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecommendationsModule = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("@nestjs/bullmq");
const queues_constants_1 = require("../../common/constants/queues.constants");
const reputation_engine_1 = require("./reputation.engine");
const reputation_worker_1 = require("./reputation.worker");
const recommendation_engine_1 = require("./recommendation.engine");
const clustering_service_1 = require("./clustering.service");
const recommendations_controller_1 = require("./recommendations.controller");
let RecommendationsModule = class RecommendationsModule {
};
exports.RecommendationsModule = RecommendationsModule;
exports.RecommendationsModule = RecommendationsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            bullmq_1.BullModule.registerQueue({ name: queues_constants_1.QUEUE_NAMES.REPUTATION }, { name: queues_constants_1.QUEUE_NAMES.RECOMMENDATIONS }),
        ],
        providers: [
            reputation_engine_1.ReputationEngine,
            reputation_worker_1.ReputationWorker,
            recommendation_engine_1.RecommendationEngine,
            clustering_service_1.ClusteringService,
        ],
        controllers: [recommendations_controller_1.RecommendationsController],
        exports: [reputation_engine_1.ReputationEngine, recommendation_engine_1.RecommendationEngine, clustering_service_1.ClusteringService],
    })
], RecommendationsModule);
//# sourceMappingURL=recommendations.module.js.map