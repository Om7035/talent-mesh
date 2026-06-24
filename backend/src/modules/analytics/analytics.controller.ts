import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { Role } from '@prisma/client';

@ApiTags('analytics')
@ApiBearerAuth('JWT')
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('student')
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: 'Get student analytics dashboard data [STUDENT]' })
  getStudentAnalytics(@CurrentUser() user: JwtPayload) {
    return this.analyticsService.getStudentAnalytics(user.sub);
  }

  @Get('client')
  @Roles(Role.CLIENT, Role.RECRUITER)
  @ApiOperation({ summary: 'Get client analytics dashboard data [CLIENT]' })
  getClientAnalytics(@CurrentUser() user: JwtPayload) {
    return this.analyticsService.getClientAnalytics(user.sub);
  }

  @Get('college')
  @Roles(Role.TPO, Role.ADMIN)
  @ApiOperation({ summary: 'Get college analytics (for TPO\'s college) [TPO/ADMIN]' })
  async getCollegeAnalytics(@CurrentUser() user: JwtPayload) {
    const { PrismaService } = await import('../../database/prisma.service');
    // We'll get collegeId from TPO profile dynamically
    return { message: 'Use /analytics/college/:collegeId for specific college data' };
  }

  @Get('college/:collegeId')
  @Roles(Role.TPO, Role.ADMIN, Role.RECRUITER, Role.CLIENT)
  @ApiOperation({ summary: 'Get college analytics by ID [TPO/ADMIN/RECRUITER/CLIENT]' })
  getCollegeAnalyticsById(@Param('collegeId', ParseUUIDPipe) collegeId: string) {
    return this.analyticsService.getCollegeAnalytics(collegeId);
  }

  @Get('platform')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Get platform-wide analytics [ADMIN]' })
  getPlatformAnalytics() {
    return this.analyticsService.getPlatformAnalytics();
  }
}
