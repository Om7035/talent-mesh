import { Controller, Get, Post, Param, Body, Query, ParseUUIDPipe, Patch, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { ClusteringService } from '../recommendations/clustering.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { Role } from '@prisma/client';

@ApiTags('admin')
@ApiBearerAuth('JWT')
@Controller('admin')
@Roles(Role.ADMIN)
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly clusteringService: ClusteringService
  ) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get platform stats [ADMIN]' })
  getPlatformStats() {
    return this.adminService.getPlatformStats();
  }

  @Post('ml/recalculate-clusters')
  @ApiOperation({ summary: 'Manually recalculate ML clusters and regenerate recommendations [ADMIN]' })
  async recalculateClusters() {
    return this.clusteringService.recalculateClusters();
  }

  @Get('users')
  @ApiOperation({ summary: 'Get paginated users [ADMIN]' })
  getUsers(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('role') role?: string,
    @Query('search') search?: string
  ) {
    return this.adminService.getUsers(Number(page), Number(limit), role, search);
  }

  @Post('users/:id/ban')
  @ApiOperation({ summary: 'Ban a user [ADMIN]' })
  banUser(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body('reason') reason: string
  ) {
    return this.adminService.banUser(user.sub, id, reason);
  }

  @Post('users/:id/unban')
  @ApiOperation({ summary: 'Reverse a ban [ADMIN]' })
  unbanUser(@CurrentUser() user: JwtPayload, @Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.unbanUser(user.sub, id);
  }

  @Post('users/:id/shadow-ban')
  @ApiOperation({ summary: 'Restrict visibility of a STUDENT or RECRUITER [ADMIN]' })
  shadowBanUser(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body('reason') reason: string,
  ) {
    return this.adminService.shadowBanUser(user.sub, id, reason);
  }

  @Post('users/:id/shadow-unban')
  @ApiOperation({ summary: 'Lift a visibility restriction [ADMIN]' })
  shadowUnbanUser(@CurrentUser() user: JwtPayload, @Param('id', ParseUUIDPipe) id: string) {
    return this.adminService.shadowUnbanUser(user.sub, id);
  }

  @Post('users')
  @ApiOperation({ summary: 'Create a new user [ADMIN]' })
  createUser(
    @CurrentUser() user: JwtPayload,
    @Body() data: any
  ) {
    return this.adminService.createUser(user.sub, data);
  }

  @Patch('users/:id')
  @ApiOperation({ summary: 'Update user role or status [ADMIN]' })
  updateUser(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() data: any
  ) {
    return this.adminService.updateUser(user.sub, id, data);
  }

  @Delete('users/:id')
  @ApiOperation({ summary: 'Delete a user permanently [ADMIN]' })
  deleteUser(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string
  ) {
    return this.adminService.deleteUser(user.sub, id);
  }

  @Get('moderation')
  @ApiOperation({ summary: 'Get moderation queue [ADMIN]' })
  getModerationQueue() {
    return this.adminService.getModerationQueue();
  }

  @Get('audit-logs')
  @ApiOperation({ summary: 'Get recent audit logs [ADMIN]' })
  getAuditLogs(@Query('page') page = 1, @Query('limit') limit = 50) {
    return this.adminService.getAuditLogs(Number(page), Number(limit));
  }
}
