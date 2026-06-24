import { Controller, Get, Post, Param, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RecruitersService } from './recruiters.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { Role } from '@prisma/client';

@ApiTags('recruiters')
@ApiBearerAuth('JWT')
@Controller('recruiters')
@Roles(Role.RECRUITER)
export class RecruitersController {
  constructor(private readonly recruitersService: RecruitersService) {}

  @Get()
  @Roles(Role.TPO, Role.ADMIN, Role.RECRUITER)
  @ApiOperation({ summary: 'List recruiters (for TPO discovery)' })
  listRecruiters() {
    return this.recruitersService.listRecruiters();
  }

  @Get('partnered-talent-pushes')
  @Roles(Role.RECRUITER)
  @ApiOperation({ summary: 'Get direct talent pushes from partnered colleges' })
  getPartneredTalentPushes(@CurrentUser() user: JwtPayload) {
    return this.recruitersService.getPartneredTalentPushes(user.sub);
  }

  @Get('discover')
  @ApiOperation({ summary: 'Discover verified talent' })
  discoverTalent(@CurrentUser() user: JwtPayload, @Query() query: any) {
    return this.recruitersService.discoverTalent(user.sub, query);
  }

  @Post('shortlist/:studentId')
  @ApiOperation({ summary: 'Shortlist a student' })
  shortlistStudent(
    @CurrentUser() user: JwtPayload,
    @Param('studentId', ParseUUIDPipe) studentId: string
  ) {
    return this.recruitersService.shortlistStudent(user.sub, studentId);
  }

  @Get('analytics')
  @ApiOperation({ summary: 'Get recruitment analytics' })
  getAnalytics(@CurrentUser() user: JwtPayload) {
    return this.recruitersService.getAnalytics(user.sub);
  }
}
