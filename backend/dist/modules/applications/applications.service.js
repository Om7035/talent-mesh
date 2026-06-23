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
exports.ApplicationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const client_1 = require("@prisma/client");
let ApplicationsService = class ApplicationsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async apply(studentUserId, projectId, dto) {
        const student = await this.prisma.student.findUnique({ where: { userId: studentUserId } });
        if (!student)
            throw new common_1.ForbiddenException('Student profile required');
        if (student.verificationStatus !== 'VERIFIED') {
            throw new common_1.BadRequestException('Your profile must be verified by your TPO to apply to projects.');
        }
        const project = await this.prisma.project.findUnique({ where: { id: projectId } });
        if (!project)
            throw new common_1.NotFoundException('Project not found');
        if (project.status !== client_1.ProjectStatus.PUBLISHED && project.status !== client_1.ProjectStatus.APPLICATIONS_OPEN) {
            throw new common_1.BadRequestException('This project is no longer accepting applications.');
        }
        const existing = await this.prisma.projectApplication.findUnique({
            where: { projectId_studentId: { projectId, studentId: student.id } },
        });
        if (existing)
            throw new common_1.ConflictException('You have already applied to this project.');
        return this.prisma.$transaction(async (tx) => {
            const app = await tx.projectApplication.create({
                data: {
                    projectId,
                    studentId: student.id,
                    coverLetter: dto.coverLetter,
                    proposedBudget: dto.proposedBudget,
                },
            });
            await tx.project.update({
                where: { id: projectId },
                data: { applicationCount: { increment: 1 } },
            });
            return app;
        });
    }
    async updateApplication(studentUserId, applicationId, dto) {
        const student = await this.prisma.student.findUnique({ where: { userId: studentUserId } });
        if (!student)
            throw new common_1.ForbiddenException();
        const app = await this.prisma.projectApplication.findUnique({ where: { id: applicationId } });
        if (!app)
            throw new common_1.NotFoundException();
        if (app.studentId !== student.id)
            throw new common_1.ForbiddenException('Not your application.');
        if (app.status !== 'APPLIED' && app.status !== 'PENDING') {
            throw new common_1.BadRequestException('Can only update applications that are still pending review.');
        }
        return this.prisma.projectApplication.update({
            where: { id: applicationId },
            data: {
                ...(dto.coverLetter && { coverLetter: dto.coverLetter }),
                ...(dto.proposedBudget && { proposedBudget: dto.proposedBudget }),
            },
        });
    }
    async getApplicationsForProject(clientUserId, projectId) {
        const client = await this.prisma.client.findUnique({ where: { userId: clientUserId } });
        const project = await this.prisma.project.findUnique({ where: { id: projectId } });
        if (!client || !project || project.clientId !== client.id) {
            throw new common_1.ForbiddenException('Only the project owner can view applications.');
        }
        return this.prisma.projectApplication.findMany({
            where: { projectId },
            include: {
                student: {
                    include: {
                        user: { select: { name: true, avatarUrl: true } },
                        skills: { include: { skill: true } },
                        college: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async updateStatus(clientUserId, applicationId, status) {
        const application = await this.prisma.projectApplication.findUnique({
            where: { id: applicationId },
            include: { project: true },
        });
        if (!application)
            throw new common_1.NotFoundException();
        const client = await this.prisma.client.findUnique({ where: { userId: clientUserId } });
        if (!client || application.project.clientId !== client.id) {
            throw new common_1.ForbiddenException('Only the project owner can update application status.');
        }
        if (application.project.status !== client_1.ProjectStatus.PUBLISHED && application.project.status !== client_1.ProjectStatus.APPLICATIONS_OPEN && application.project.status !== client_1.ProjectStatus.ASSIGNED) {
            throw new common_1.BadRequestException('Cannot update applications for closed projects.');
        }
        return this.prisma.$transaction(async (tx) => {
            const updated = await tx.projectApplication.update({
                where: { id: applicationId },
                data: { status },
            });
            if (status === 'ACCEPTED') {
                await tx.projectApplication.updateMany({
                    where: { projectId: application.projectId, id: { not: applicationId } },
                    data: { status: 'REJECTED' },
                });
            }
            return updated;
        });
    }
    async getMyApplications(studentUserId) {
        const student = await this.prisma.student.findUnique({ where: { userId: studentUserId } });
        if (!student)
            return [];
        return this.prisma.projectApplication.findMany({
            where: { studentId: student.id },
            include: {
                project: {
                    select: { title: true, status: true, difficulty: true, budget: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async withdrawApplication(studentUserId, applicationId) {
        const student = await this.prisma.student.findUnique({ where: { userId: studentUserId } });
        if (!student)
            throw new common_1.ForbiddenException();
        const app = await this.prisma.projectApplication.findUnique({ where: { id: applicationId } });
        if (!app)
            throw new common_1.NotFoundException();
        if (app.studentId !== student.id)
            throw new common_1.ForbiddenException('Not your application.');
        if (app.status === 'ACCEPTED') {
            throw new common_1.BadRequestException('Cannot withdraw an accepted application.');
        }
        return this.prisma.$transaction(async (tx) => {
            await tx.projectApplication.update({
                where: { id: applicationId },
                data: { status: 'WITHDRAWN' },
            });
            await tx.project.update({
                where: { id: app.projectId },
                data: { applicationCount: { decrement: 1 } },
            });
        });
    }
};
exports.ApplicationsService = ApplicationsService;
exports.ApplicationsService = ApplicationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ApplicationsService);
//# sourceMappingURL=applications.service.js.map