import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateProjectDto, UpdateProjectDto, ProjectQueryDto } from './dto/project.dto';
import { ProjectStatus, Role } from '@prisma/client';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { SkillsService } from '../skills/skills.service';
import { RecommendationEngine } from '../recommendations/recommendation.engine';

@Injectable()
export class ProjectsService {
  private readonly logger = new Logger(ProjectsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly skillsService: SkillsService,
    private readonly recommendationEngine: RecommendationEngine,
  ) {}

  // ─────────────────────────────────────────────────────────────────
  // CREATE
  // ─────────────────────────────────────────────────────────────────

  async create(clientUserId: string, dto: CreateProjectDto) {
    const client = await this.prisma.client.findUnique({
      where: { userId: clientUserId },
    });
    if (!client) throw new ForbiddenException('Client profile not found.');

    const skillConnections = dto.skillIds?.map((id) => ({ skillId: id })) ?? [];

    if (dto.skillNames?.length) {
      const resolvedSkills = await Promise.all(
        dto.skillNames.map((name) => this.skillsService.findOrCreate(name)),
      );
      skillConnections.push(...resolvedSkills.map((s) => ({ skillId: s.id })));
    }

    const project = await this.prisma.project.create({
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

    await this.recommendationEngine.enqueueForProject(project.id);

    return project;
  }

  // ─────────────────────────────────────────────────────────────────
  // FIND ALL (Marketplace with search + filters)
  // ─────────────────────────────────────────────────────────────────

  async findAll(query: ProjectQueryDto) {
    const {
      search,
      category,
      difficulty,
      minBudget,
      maxBudget,
      status = ProjectStatus.PUBLISHED,
      page = 1,
      limit = 12,
      sortBy = 'createdAt',
      order = 'desc',
    } = query;

    const where: Record<string, unknown> = {
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

  // ─────────────────────────────────────────────────────────────────
  // FIND ONE
  // ─────────────────────────────────────────────────────────────────

  async findOne(id: string, requestingUser?: JwtPayload) {
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

    if (!project) throw new NotFoundException('Project not found.');

    // Increment view count asynchronously (fire-and-forget)
    this.prisma.project
      .update({ where: { id }, data: { viewCount: { increment: 1 } } })
      .catch(() => {});

    return this.sanitizeProject(project);
  }

  // ─────────────────────────────────────────────────────────────────
  // UPDATE
  // ─────────────────────────────────────────────────────────────────

  async update(id: string, clientUserId: string, dto: UpdateProjectDto & { status?: ProjectStatus }) {
    const project = await this.findProjectAndVerifyOwnership(id, clientUserId);

    if (
      project.status !== ProjectStatus.PUBLISHED &&
      project.status !== ProjectStatus.DRAFT &&
      project.status !== ProjectStatus.ASSIGNED
    ) {
      throw new BadRequestException(
        'Only DRAFT, PUBLISHED or ASSIGNED projects can be updated.',
      );
    }

    if (dto.status) {
      // Basic validation for status transitions
      const validTransitions: Record<string, ProjectStatus[]> = {
        [ProjectStatus.DRAFT]: [ProjectStatus.PUBLISHED, ProjectStatus.CANCELLED],
        [ProjectStatus.PUBLISHED]: [ProjectStatus.APPLICATIONS_OPEN, ProjectStatus.APPLICATIONS_CLOSED, ProjectStatus.CANCELLED, ProjectStatus.ARCHIVED],
        [ProjectStatus.APPLICATIONS_OPEN]: [ProjectStatus.APPLICATIONS_CLOSED, ProjectStatus.CANCELLED],
        [ProjectStatus.APPLICATIONS_CLOSED]: [ProjectStatus.APPLICATIONS_OPEN, ProjectStatus.CANCELLED],
      };

      if (validTransitions[project.status] && !validTransitions[project.status].includes(dto.status)) {
        throw new BadRequestException(`Invalid transition from ${project.status} to ${dto.status}`);
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

  // ─────────────────────────────────────────────────────────────────
  // DUPLICATE
  // ─────────────────────────────────────────────────────────────────

  async duplicate(id: string, clientUserId: string) {
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
        status: ProjectStatus.DRAFT,
        skills: { create: skillConnections },
      },
    });
  }

  // ─────────────────────────────────────────────────────────────────
  // CANCEL / DELETE
  // ─────────────────────────────────────────────────────────────────

  async cancel(id: string, clientUserId: string) {
    const project = await this.findProjectAndVerifyOwnership(id, clientUserId);

    if (project.status === ProjectStatus.IN_PROGRESS) {
      throw new BadRequestException(
        'Cannot cancel a project that is in progress. File a dispute instead.',
      );
    }

    return this.prisma.project.update({
      where: { id },
      data: { status: ProjectStatus.CANCELLED },
    });
  }

  // ─────────────────────────────────────────────────────────────────
  // CLIENT'S OWN PROJECTS
  // ─────────────────────────────────────────────────────────────────

  async getClientProjects(clientUserId: string) {
    const client = await this.prisma.client.findUnique({
      where: { userId: clientUserId },
    });
    if (!client) throw new ForbiddenException('Client profile not found.');

    return this.prisma.project.findMany({
      where: { clientId: client.id },
      include: {
        skills: { include: { skill: true } },
        _count: { select: { applications: true, contracts: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ─────────────────────────────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────────────────────────────

  private async findProjectAndVerifyOwnership(projectId: string, clientUserId: string) {
    const client = await this.prisma.client.findUnique({
      where: { userId: clientUserId },
    });
    if (!client) throw new ForbiddenException('Client profile not found.');

    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) throw new NotFoundException('Project not found.');
    if (project.clientId !== client.id) {
      throw new ForbiddenException('You do not own this project.');
    }

    return project;
  }

  /** Masks client name if project has `hideClientName: true` */
  private sanitizeProject(project: any) {
    if (project.hideClientName) {
      return {
        ...project,
        client: { ...project.client, companyName: null, user: { name: 'Anonymous Client' } },
      };
    }
    return project;
  }
}
