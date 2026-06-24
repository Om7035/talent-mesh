import { Controller, Get, Param, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { RecommendationEngine } from './recommendation.engine';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { Role } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';

@ApiTags('recommendations')
@ApiBearerAuth('JWT')
@Controller('recommendations')
export class RecommendationsController {
  constructor(
    private readonly recommendationEngine: RecommendationEngine,
    private readonly prisma: PrismaService,
  ) {}

  @Get('for-me')
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: 'Get AI-recommended projects for current student [STUDENT]' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  async getForMe(
    @CurrentUser() user: JwtPayload,
    @Query('limit') limit = 10,
  ) {
    const student = await this.prisma.student.findUnique({ where: { userId: user.sub } });
    if (!student) return [];
    return this.recommendationEngine.getForStudent(student.id, Number(limit));
  }

  @Get('project/:projectId/candidates')
  @Roles(Role.CLIENT, Role.RECRUITER, Role.ADMIN)
  @ApiOperation({ summary: 'Get best-matched student candidates for a project [CLIENT/RECRUITER]' })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  getForProject(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @Query('limit') limit = 10,
  ) {
    return this.recommendationEngine.getForProject(projectId, Number(limit));
  }
}
