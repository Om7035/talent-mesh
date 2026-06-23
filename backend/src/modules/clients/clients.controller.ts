import { Controller, Get, Patch, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ClientsService } from './clients.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { Role } from '@prisma/client';

@ApiTags('clients')
@ApiBearerAuth('JWT')
@Controller('clients')
@Roles(Role.CLIENT)
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current client profile' })
  getProfile(@CurrentUser() user: JwtPayload) {
    return this.clientsService.getProfile(user.sub);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update client profile' })
  updateProfile(@CurrentUser() user: JwtPayload, @Body() dto: any) {
    return this.clientsService.updateProfile(user.sub, dto);
  }

  @Get('me/candidates')
  @ApiOperation({ summary: 'View all candidates across client projects' })
  getClientCandidates(@CurrentUser() user: JwtPayload) {
    return this.clientsService.getClientCandidates(user.sub);
  }
}
