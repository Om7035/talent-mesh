import { Controller, Get, Param, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { LeaderboardService } from './leaderboard.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { Role } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('leaderboard')
@Controller('leaderboard')
export class LeaderboardController {
  constructor(
    private readonly leaderboardService: LeaderboardService,
    private readonly prisma: PrismaService,
  ) {}

  @Public()
  @Get('global')
  @ApiOperation({ summary: 'Global student leaderboard' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getGlobal(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.leaderboardService.getGlobalLeaderboard(Number(page), Number(limit));
  }

  @Public()
  @Get('college/:collegeId')
  @ApiOperation({ summary: 'College-specific leaderboard' })
  getCollegeBoard(
    @Param('collegeId', ParseUUIDPipe) collegeId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    return this.leaderboardService.getCollegeLeaderboard(collegeId, Number(page), Number(limit));
  }

  @Public()
  @Get('skills')
  @ApiOperation({ summary: 'Skill-based leaderboard showing top experts per skill' })
  getSkillBoard() {
    return this.leaderboardService.getSkillLeaderboard();
  }

  @Get('my-rank')
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: 'Get current student\'s rank across all dimensions [STUDENT]' })
  async getMyRank(@CurrentUser() user: JwtPayload) {
    const student = await this.prisma.student.findUnique({ where: { userId: user.sub } });
    if (!student) return null;
    return this.leaderboardService.getStudentRank(student.id);
  }
}
