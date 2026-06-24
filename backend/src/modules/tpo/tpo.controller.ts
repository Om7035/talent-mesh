import { Controller, Get, Param, Patch, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { TpoService } from './tpo.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { Role } from '@prisma/client';

@ApiTags('tpo')
@ApiBearerAuth('JWT')
@Controller('tpo')
@Roles(Role.TPO)
export class TpoController {
  constructor(private readonly tpoService: TpoService) {}

  @Get('students')
  @ApiOperation({ summary: 'Get all students in college [TPO]' })
  getCollegeStudents(
    @CurrentUser() user: JwtPayload,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('search') search?: string,
    @Query('departmentId') departmentId?: string,
    @Query('verificationStatus') verificationStatus?: string,
    @Query('clusterTier') clusterTier?: string,
  ) {
    return this.tpoService.getCollegeStudents(user.sub, Number(page), Number(limit), {
      search, departmentId, verificationStatus, clusterTier,
    });
  }

  @Get('analytics')
  @ApiOperation({ summary: 'Get college analytics summary [TPO]' })
  getCollegeAnalyticsSummary(@CurrentUser() user: JwtPayload) {
    return this.tpoService.getCollegeAnalyticsSummary(user.sub);
  }

  @Get('verifications/pending')
  @ApiOperation({ summary: 'Get pending student verifications [TPO]' })
  getPendingVerifications(@CurrentUser() user: JwtPayload) {
    return this.tpoService.getPendingVerifications(user.sub);
  }

  @Patch('verify/:studentId')
  @ApiOperation({ summary: 'Approve student verification' })
  verifyStudent(@Param('studentId') studentId: string, @CurrentUser() user: JwtPayload) {
    return this.tpoService.verifyStudent(user.sub, studentId);
  }

  @Patch('reject/:studentId')
  @ApiOperation({ summary: 'Reject student verification' })
  rejectStudent(
    @Param('studentId') studentId: string, 
    @CurrentUser() user: JwtPayload,
    @Body('reason') reason?: string
  ) {
    return this.tpoService.rejectStudent(user.sub, studentId, reason);
  }

  @Get('report')
  @ApiOperation({ summary: 'Generate college report data [TPO]' })
  generateReport(@CurrentUser() user: JwtPayload) {
    return this.tpoService.generateReport(user.sub);
  }

  @Patch('students/:studentId/shadow-ban')
  @ApiOperation({ summary: 'Restrict a student\'s visibility (own college only) [TPO]' })
  shadowBanStudent(
    @Param('studentId') studentId: string,
    @CurrentUser() user: JwtPayload,
    @Body('reason') reason: string,
  ) {
    return this.tpoService.shadowBanStudent(user.sub, studentId, reason);
  }

  @Patch('students/:studentId/shadow-unban')
  @ApiOperation({ summary: 'Lift a student\'s visibility restriction (own college only) [TPO]' })
  shadowUnbanStudent(@Param('studentId') studentId: string, @CurrentUser() user: JwtPayload) {
    return this.tpoService.shadowUnbanStudent(user.sub, studentId);
  }

  @Patch('students/:studentId/toggle-recommended')
  @ApiOperation({ summary: 'Toggle "TPO Recommended" badge for a student (own college only) [TPO]' })
  toggleRecommended(@Param('studentId') studentId: string, @CurrentUser() user: JwtPayload) {
    return this.tpoService.toggleRecommended(user.sub, studentId);
  }

  @Patch('students/:studentId/recommend/:projectId')
  @ApiOperation({ summary: 'Recommend a student for a specific project to its client [TPO]' })
  recommendStudentForProject(
    @Param('studentId') studentId: string,
    @Param('projectId') projectId: string,
    @CurrentUser() user: JwtPayload,
    @Body('message') message?: string,
  ) {
    return this.tpoService.recommendStudentForProject(user.sub, studentId, projectId, message);
  }

  @Get('hiring-clients')
  @ApiOperation({ summary: 'Get clients hiring from this college [TPO]' })
  getHiringClients(@CurrentUser() user: JwtPayload) {
    return this.tpoService.getHiringClients(user.sub);
  }
}
