import { Controller, Get, Post, Patch, Param, Body, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PartnershipsService } from './partnerships.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { Role } from '@prisma/client';
import { RequestPartnershipDto } from './dto/request-partnership.dto';

@ApiTags('partnerships')
@ApiBearerAuth('JWT')
@Controller('partnerships')
export class PartnershipsController {
  constructor(private readonly partnershipsService: PartnershipsService) {}

  @Post('request')
  @Roles(Role.TPO, Role.RECRUITER)
  @ApiOperation({ summary: 'Request a new college-recruiter partnership' })
  requestPartnership(
    @CurrentUser() user: JwtPayload,
    @Body() dto: RequestPartnershipDto,
  ) {
    if (user.role === Role.TPO && !dto.recruiterId) {
      throw new BadRequestException('recruiterId is required when requested by TPO');
    }
    if (user.role === Role.RECRUITER && !dto.collegeId) {
      throw new BadRequestException('collegeId is required when requested by RECRUITER');
    }
    return this.partnershipsService.requestPartnership(user, dto);
  }

  @Patch(':id/accept')
  @Roles(Role.TPO, Role.RECRUITER)
  @ApiOperation({ summary: 'Accept a partnership request' })
  acceptPartnership(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.partnershipsService.acceptPartnership(id, user);
  }

  @Patch(':id/reject')
  @Roles(Role.TPO, Role.RECRUITER)
  @ApiOperation({ summary: 'Reject a partnership request' })
  rejectPartnership(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.partnershipsService.rejectPartnership(id, user);
  }

  @Get('my')
  @Roles(Role.TPO, Role.RECRUITER)
  @ApiOperation({ summary: 'Get all partnerships for the current user' })
  getMyPartnerships(@CurrentUser() user: JwtPayload) {
    return this.partnershipsService.getMyPartnerships(user);
  }
}
