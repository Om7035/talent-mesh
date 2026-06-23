import { Controller, Get, Post, Param, Body, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DisputesService } from './disputes.service';
import { ResolveDisputeDto } from './dto/dispute.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { Role } from '@prisma/client';

@ApiTags('disputes')
@ApiBearerAuth('JWT')
@Controller('disputes')
export class DisputesController {
  constructor(private readonly disputesService: DisputesService) {}

  @Get()
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'List all disputes [ADMIN]' })
  findAll() {
    return this.disputesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get dispute details' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload
  ) {
    return this.disputesService.findOne(id, user.sub, user.role);
  }

  @Post(':id/resolve')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Resolve a dispute [ADMIN]' })
  resolve(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: ResolveDisputeDto
  ) {
    return this.disputesService.resolve(user.sub, id, dto);
  }
}
