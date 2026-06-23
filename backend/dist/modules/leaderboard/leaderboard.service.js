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
var LeaderboardService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeaderboardService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../database/prisma.service");
let LeaderboardService = LeaderboardService_1 = class LeaderboardService {
    constructor(prisma) {
        this.prisma = prisma;
        this.logger = new common_1.Logger(LeaderboardService_1.name);
    }
    async getGlobalLeaderboard(page = 1, limit = 20) {
        const [entries, total] = await Promise.all([
            this.prisma.leaderboard.findMany({
                orderBy: { globalRank: 'asc' },
                skip: (page - 1) * limit,
                take: limit,
                include: {
                    student: {
                        include: {
                            user: { select: { name: true, avatarUrl: true } },
                            college: { select: { name: true } },
                            skills: {
                                include: { skill: { select: { name: true } } },
                                orderBy: { endorsed: 'desc' },
                                take: 3,
                            },
                        },
                    },
                },
            }),
            this.prisma.leaderboard.count(),
        ]);
        return {
            entries: entries.map((e) => this.formatEntry(e)),
            pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }
    async getCollegeLeaderboard(collegeId, page = 1, limit = 20) {
        const [entries, total] = await Promise.all([
            this.prisma.leaderboard.findMany({
                where: { student: { collegeId } },
                orderBy: { collegeRank: 'asc' },
                skip: (page - 1) * limit,
                take: limit,
                include: {
                    student: {
                        include: {
                            user: { select: { name: true, avatarUrl: true } },
                            department: { select: { name: true } },
                        },
                    },
                },
            }),
            this.prisma.leaderboard.count({ where: { student: { collegeId } } }),
        ]);
        return {
            entries: entries.map((e) => this.formatEntry(e, 'collegeRank')),
            pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }
    async getSkillLeaderboard() {
        const skills = await this.prisma.skill.findMany({
            include: {
                students: {
                    orderBy: { endorsed: 'desc' },
                    take: 1,
                    include: {
                        student: {
                            include: {
                                user: { select: { name: true } },
                            },
                        },
                    },
                },
                _count: { select: { students: true } },
            },
            orderBy: { students: { _count: 'desc' } },
            take: 20,
        });
        return skills.map((skill, idx) => ({
            rank: idx + 1,
            skill: skill.name,
            expertCount: skill._count.students,
            topExpert: skill.students[0]?.student.user.name ?? 'N/A',
        }));
    }
    async getStudentRank(studentId) {
        return this.prisma.leaderboard.findUnique({
            where: { studentId },
            include: {
                student: {
                    include: {
                        user: { select: { name: true, avatarUrl: true } },
                        college: { select: { name: true } },
                        department: { select: { name: true } },
                    },
                },
            },
        });
    }
    async rebuildGlobalRankings() {
        this.logger.log('Rebuilding global leaderboard rankings...');
        const rankings = await this.prisma.$queryRaw `
      WITH ranked AS (
        SELECT
          s.id AS "studentId",
          -- Composite score formula
          (
            s."reputationScore" * 0.40 +
            s."completionRate" * 100 * 0.35 +
            LEAST(s."totalEarnings" / 1000.0, 100) * 0.25
          ) AS score,
          DENSE_RANK() OVER (
            ORDER BY (
              s."reputationScore" * 0.40 +
              s."completionRate" * 100 * 0.35 +
              LEAST(s."totalEarnings" / 1000.0, 100) * 0.25
            ) DESC
          ) AS "globalRank",
          DENSE_RANK() OVER (
            PARTITION BY s."collegeId"
            ORDER BY (
              s."reputationScore" * 0.40 +
              s."completionRate" * 100 * 0.35 +
              LEAST(s."totalEarnings" / 1000.0, 100) * 0.25
            ) DESC
          ) AS "collegeRank",
          DENSE_RANK() OVER (
            PARTITION BY s."departmentId"
            ORDER BY (
              s."reputationScore" * 0.40 +
              s."completionRate" * 100 * 0.35 +
              LEAST(s."totalEarnings" / 1000.0, 100) * 0.25
            ) DESC
          ) AS "departmentRank"
        FROM students s
        WHERE s."isActive" = true
      )
      SELECT * FROM ranked
    `;
        await Promise.all(rankings.map((r) => this.prisma.leaderboard.upsert({
            where: { studentId: r.studentId },
            create: {
                studentId: r.studentId,
                globalRank: Number(r.globalRank),
                collegeRank: Number(r.collegeRank),
                departmentRank: Number(r.departmentRank),
                score: Number(r.score),
            },
            update: {
                globalRank: Number(r.globalRank),
                collegeRank: Number(r.collegeRank),
                departmentRank: Number(r.departmentRank),
                score: Number(r.score),
                updatedAt: new Date(),
            },
        })));
        this.logger.log(`Rebuilt rankings for ${rankings.length} students`);
    }
    formatEntry(entry, rankField = 'globalRank') {
        return {
            rank: entry[rankField],
            score: entry.score,
            student: {
                id: entry.student.id,
                name: entry.student.user.name,
                avatarUrl: entry.student.user.avatarUrl,
                college: entry.student.college?.name,
                department: entry.student.department?.name,
                reputationScore: entry.student.reputationScore,
                totalEarnings: entry.student.totalEarnings,
                projectsCompleted: entry.student.projectsCompleted,
                topSkills: entry.student.skills?.map((s) => s.skill.name),
            },
        };
    }
};
exports.LeaderboardService = LeaderboardService;
exports.LeaderboardService = LeaderboardService = LeaderboardService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LeaderboardService);
//# sourceMappingURL=leaderboard.service.js.map