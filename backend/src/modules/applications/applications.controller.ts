import { Controller, Post, Get, Patch, Delete, Body, Param, ParseUUIDPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto, UpdateApplicationStatusDto } from './dto/application.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { Role } from '@prisma/client';

@ApiTags('applications')
@ApiBearerAuth('JWT')
@Controller()
export class ApplicationsController {
  constructor(private readonly applicationsService: ApplicationsService) {}

  @Post('projects/:projectId/applications')
  @Roles(Role.STUDENT)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Apply to a project [STUDENT]' })
  apply(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateApplicationDto,
  ) {
    return this.applicationsService.apply(user.sub, projectId, dto);
  }

  @Get('projects/:projectId/applications')
  @Roles(Role.CLIENT)
  @ApiOperation({ summary: 'Get all applications for a project [CLIENT]' })
  getProjectApplications(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.applicationsService.getApplicationsForProject(user.sub, projectId);
  }

  @Patch('applications/:id/status')
  @Roles(Role.CLIENT)
  @ApiOperation({ summary: 'Update application status [CLIENT]' })
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateApplicationStatusDto,
  ) {
    return this.applicationsService.updateStatus(user.sub, id, dto.status);
  }

  @Patch('applications/:id')
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: 'Update application proposal [STUDENT]' })
  updateApplication(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: Partial<CreateApplicationDto>,
  ) {
    return this.applicationsService.updateApplication(user.sub, id, dto);
  }

  @Get('applications/my')
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: 'Get current student applications [STUDENT]' })
  getMyApplications(@CurrentUser() user: JwtPayload) {
    return this.applicationsService.getMyApplications(user.sub);
  }

  @Delete('applications/:id')
  @Roles(Role.STUDENT)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Withdraw an application [STUDENT]' })
  withdraw(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.applicationsService.withdrawApplication(user.sub, id);
  }
}
