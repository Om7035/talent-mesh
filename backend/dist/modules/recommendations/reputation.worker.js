"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var ReputationWorker_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReputationWorker = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const common_1 = require("@nestjs/common");
const bullmq_2 = require("bullmq");
const queues_constants_1 = require("../../common/constants/queues.constants");
const reputation_engine_1 = require("./reputation.engine");
let ReputationWorker = ReputationWorker_1 = class ReputationWorker extends bullmq_1.WorkerHost {
    constructor(reputationEngine) {
        super();
        this.reputationEngine = reputationEngine;
        this.logger = new common_1.Logger(ReputationWorker_1.name);
    }
    async process(job) {
        switch (job.name) {
            case queues_constants_1.JOB_NAMES.REPUTATION.RECALCULATE:
                await this.handleRecalculation(job);
                break;
            default:
                this.logger.warn(`Unknown reputation job: ${job.name}`);
        }
    }
    async handleRecalculation(job) {
        const { studentId } = job.data;
        this.logger.debug(`Processing reputation recalculation for student: ${studentId}`);
        await this.reputationEngine.recalculate(studentId);
    }
    onCompleted(job) {
        this.logger.debug(`Job ${job.id} (${job.name}) completed`);
    }
    onFailed(job, error) {
        this.logger.error(`Job ${job.id} (${job.name}) failed: ${error.message}`);
    }
};
exports.ReputationWorker = ReputationWorker;
__decorate([
    (0, bullmq_1.OnWorkerEvent)('completed'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [bullmq_2.Job]),
    __metadata("design:returntype", void 0)
], ReputationWorker.prototype, "onCompleted", null);
__decorate([
    (0, bullmq_1.OnWorkerEvent)('failed'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [bullmq_2.Job, Error]),
    __metadata("design:returntype", void 0)
], ReputationWorker.prototype, "onFailed", null);
exports.ReputationWorker = ReputationWorker = ReputationWorker_1 = __decorate([
    (0, bullmq_1.Processor)(queues_constants_1.QUEUE_NAMES.REPUTATION),
    __metadata("design:paramtypes", [reputation_engine_1.ReputationEngine])
], ReputationWorker);
//# sourceMappingURL=reputation.worker.js.map