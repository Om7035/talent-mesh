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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const client_1 = require("@prisma/client");
let ReviewsService = class ReviewsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createReview(reviewerUserId, contractId, dto) {
        const contract = await this.prisma.contract.findUnique({
            where: { id: contractId },
            include: { project: true, student: { select: { userId: true, id: true } } }
        });
        if (!contract)
            throw new common_1.NotFoundException('Contract not found');
        if (contract.status !== client_1.ProjectStatus.COMPLETED && contract.status !== client_1.ProjectStatus.RELEASED) {
            throw new common_1.ForbiddenException('Can only review completed or released contracts');
        }
        const client = await this.prisma.client.findUnique({ where: { id: contract.project.clientId } });
        let reviewerRole = null;
        let revieweeId = null;
        let revieweeRole = null;
        if (contract.student.userId === reviewerUserId) {
            reviewerRole = 'STUDENT';
            revieweeId = contract.project.clientId;
            revieweeRole = 'CLIENT';
        }
        else if (client?.userId === reviewerUserId) {
            reviewerRole = 'CLIENT';
            revieweeId = contract.student.id;
            revieweeRole = 'STUDENT';
        }
        else {
            throw new common_1.ForbiddenException('Only contract participants can leave a review');
        }
        const existing = await this.prisma.review.findUnique({
            where: { contractId_reviewerId: { contractId, reviewerId: reviewerUserId } }
        });
        if (existing)
            throw new common_1.ConflictException('You have already reviewed this contract');
        let finalRating = dto.rating;
        if (!finalRating) {
            const scores = [dto.communication, dto.quality, dto.timeliness, dto.professionalism, dto.technicalSkill].filter(Boolean);
            finalRating = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 5.0;
        }
        const review = await this.prisma.review.create({
            data: {
                contractId,
                reviewerId: reviewerUserId,
                reviewerRole,
                revieweeId,
                revieweeRole,
                rating: finalRating,
                communication: dto.communication,
                quality: dto.quality,
                timeliness: dto.timeliness,
                professionalism: dto.professionalism,
                technicalSkill: dto.technicalSkill,
                feedback: dto.feedback ?? '',
                studentId: revieweeRole === 'STUDENT' ? revieweeId : null,
                clientId: revieweeRole === 'CLIENT' ? revieweeId : null,
            }
        });
        if (revieweeRole === 'CLIENT') {
            const allReviews = await this.prisma.review.findMany({
                where: { clientId: revieweeId },
                select: { rating: true }
            });
            const newAvg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
            await this.prisma.client.update({
                where: { id: revieweeId },
                data: { avgRating: newAvg }
            });
        }
        return review;
    }
    async getStudentReviews(studentId) {
        return this.prisma.review.findMany({
            where: { studentId },
            include: {
                contract: {
                    select: { project: { select: { title: true } } }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }
};
exports.ReviewsService = ReviewsService;
exports.ReviewsService = ReviewsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReviewsService);
//# sourceMappingURL=reviews.service.js.map