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
var ProjectsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProjectsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
const client_1 = require("@prisma/client");
let ProjectsService = ProjectsService_1 = class ProjectsService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(ProjectsService_1.name);
    }
    async create(clientUserId, dto) {
        const client = await this.prisma.client.findUnique({
            where: { userId: clientUserId },
        });
        if (!client)
            throw new common_1.ForbiddenException('Client profile not found.');
        const skillConnections = dto.skillIds?.map((id) => ({ skillId: id })) ?? [];
        return this.prisma.project.create({
            data: {
                clientId: client.id,
                title: dto.title,
                description: dto.description,
                budget: dto.budget,
                timelineDays: dto.timelineDays,
                difficulty: dto.difficulty,
                category: dto.category,
                projectType: dto.projectType ?? 'One-time Project',
                ndaRequired: dto.ndaRequired ?? false,
                hideClientName: dto.hideClientName ?? false,
                communicationPref: dto.communicationPref ?? 'Email',
                skills: { create: skillConnections },
            },
            include: {
                skills: { include: { skill: true } },
                client: { include: { user: { select: { name: true } } } },
            },
        });
    }
    async findAll(query) {
        const { search, category, difficulty, minBudget, maxBudget, status = client_1.ProjectStatus.PUBLISHED, page = 1, limit = 12, sortBy = 'createdAt', order = 'desc', } = query;
        const where = {
            status,
            ...(category && { category }),
            ...(difficulty && { difficulty }),
            ...(minBudget || maxBudget ? {
                budget: {
                    ...(minBudget && { gte: minBudget }),
                    ...(maxBudget && { lte: maxBudget }),
                },
            } : {}),
            ...(search && {
                OR: [
                    { title: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } },
                ],
            }),
        };
        const [projects, total] = await Promise.all([
            this.prisma.project.findMany({
                where,
                include: {
                    skills: { include: { skill: { select: { id: true, name: true } } } },
                    client: {
                        select: {
                            companyName: true,
                            user: { select: { name: true } },
                        },
                    },
                    _count: { select: { applications: true } },
                },
                orderBy: { [sortBy]: order },
                skip: (page - 1) * limit,
                take: limit,
            }),
            this.prisma.project.count({ where }),
        ]);
        return {
            projects: projects.map((p) => this.sanitizeProject(p)),
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async findOne(id, requestingUser) {
        const project = await this.prisma.project.findUnique({
            where: { id },
            include: {
                skills: { include: { skill: true } },
                client: {
                    select: {
                        id: true,
                        companyName: true,
                        user: { select: { name: true, avatarUrl: true } },
                    },
                },
                _count: { select: { applications: true } },
            },
        });
        if (!project)
            throw new common_1.NotFoundException('Project not found.');
        this.prisma.project
            .update({ where: { id }, data: { viewCount: { increment: 1 } } })
            .catch(() => { });
        return this.sanitizeProject(project);
    }
    async update(id, clientUserId, dto) {
        const project = await this.findProjectAndVerifyOwnership(id, clientUserId);
        if (project.status !== client_1.ProjectStatus.PUBLISHED &&
            project.status !== client_1.ProjectStatus.DRAFT &&
            project.status !== client_1.ProjectStatus.ASSIGNED) {
            throw new common_1.BadRequestException('Only DRAFT, PUBLISHED or ASSIGNED projects can be updated.');
        }
        if (dto.status) {
            const validTransitions = {
                [client_1.ProjectStatus.DRAFT]: [client_1.ProjectStatus.PUBLISHED, client_1.ProjectStatus.CANCELLED],
                [client_1.ProjectStatus.PUBLISHED]: [client_1.ProjectStatus.APPLICATIONS_OPEN, client_1.ProjectStatus.APPLICATIONS_CLOSED, client_1.ProjectStatus.CANCELLED, client_1.ProjectStatus.ARCHIVED],
                [client_1.ProjectStatus.APPLICATIONS_OPEN]: [client_1.ProjectStatus.APPLICATIONS_CLOSED, client_1.ProjectStatus.CANCELLED],
                [client_1.ProjectStatus.APPLICATIONS_CLOSED]: [client_1.ProjectStatus.APPLICATIONS_OPEN, client_1.ProjectStatus.CANCELLED],
            };
            if (validTransitions[project.status] && !validTransitions[project.status].includes(dto.status)) {
                throw new common_1.BadRequestException(`Invalid transition from ${project.status} to ${dto.status}`);
            }
        }
        return this.prisma.project.update({
            where: { id },
            data: {
                ...(dto.title && { title: dto.title }),
                ...(dto.description && { description: dto.description }),
                ...(dto.budget && { budget: dto.budget }),
                ...(dto.timelineDays && { timelineDays: dto.timelineDays }),
                ...(dto.difficulty && { difficulty: dto.difficulty }),
                ...(dto.category && { category: dto.category }),
                ...(dto.status && { status: dto.status }),
            },
        });
    }
    async duplicate(id, clientUserId) {
        const project = await this.findProjectAndVerifyOwnership(id, clientUserId);
        const skills = await this.prisma.projectSkill.findMany({
            where: { projectId: id },
        });
        const skillConnections = skills.map((s) => ({ skillId: s.skillId }));
        return this.prisma.project.create({
            data: {
                clientId: project.clientId,
                title: `${project.title} (Copy)`,
                description: project.description,
                budget: project.budget,
                timelineDays: project.timelineDays,
                difficulty: project.difficulty,
                category: project.category,
                projectType: project.projectType,
                ndaRequired: project.ndaRequired,
                hideClientName: project.hideClientName,
                communicationPref: project.communicationPref,
                status: client_1.ProjectStatus.DRAFT,
                skills: { create: skillConnections },
            },
        });
    }
    async cancel(id, clientUserId) {
        const project = await this.findProjectAndVerifyOwnership(id, clientUserId);
        if (project.status === client_1.ProjectStatus.IN_PROGRESS) {
            throw new common_1.BadRequestException('Cannot cancel a project that is in progress. File a dispute instead.');
        }
        return this.prisma.project.update({
            where: { id },
            data: { status: client_1.ProjectStatus.CANCELLED },
        });
    }
    async getClientProjects(clientUserId) {
        const client = await this.prisma.client.findUnique({
            where: { userId: clientUserId },
        });
        if (!client)
            throw new common_1.ForbiddenException('Client profile not found.');
        return this.prisma.project.findMany({
            where: { clientId: client.id },
            include: {
                skills: { include: { skill: true } },
                _count: { select: { applications: true, contracts: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findProjectAndVerifyOwnership(projectId, clientUserId) {
        const client = await this.prisma.client.findUnique({
            where: { userId: clientUserId },
        });
        if (!client)
            throw new common_1.ForbiddenException('Client profile not found.');
        const project = await this.prisma.project.findUnique({
            where: { id: projectId },
        });
        if (!project)
            throw new common_1.NotFoundException('Project not found.');
        if (project.clientId !== client.id) {
            throw new common_1.ForbiddenException('You do not own this project.');
        }
        return project;
    }
    sanitizeProject(project) {
        if (project.hideClientName) {
            return {
                ...project,
                client: { ...project.client, companyName: null, user: { name: 'Anonymous Client' } },
            };
        }
        return project;
    }
};
exports.ProjectsService = ProjectsService;
exports.ProjectsService = ProjectsService = ProjectsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProjectsService);
//# sourceMappingURL=projects.service.js.map