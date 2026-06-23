import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { ContractsService } from './contracts.service';
import { SubmitDeliverableDto, ApproveDeliverableDto, FileDisputeDto } from './dto/contract.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { Role } from '@prisma/client';

@ApiTags('contracts')
@ApiBearerAuth('JWT')
@Controller('contracts')
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get contract details (parties + admin only)' })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.contractsService.findOne(id, user.sub);
  }

  @Get('project/:projectId')
  @ApiOperation({ summary: 'Get active contract by Project ID' })
  findByProject(
    @Param('projectId', ParseUUIDPipe) projectId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.contractsService.findByProjectId(projectId, user.sub);
  }

  @Post('from-application/:applicationId')
  @Roles(Role.CLIENT)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create contract from accepted application [CLIENT]' })
  createFromApplication(
    @Param('applicationId', ParseUUIDPipe) applicationId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.contractsService.createFromApplication(applicationId, user.sub);
  }

  @Post(':id/accept')
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: 'Accept an offer [STUDENT]' })
  acceptOffer(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.contractsService.acceptOffer(id, user.sub);
  }

  @Post(':id/reject')
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: 'Reject an offer [STUDENT]' })
  rejectOffer(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.contractsService.rejectOffer(id, user.sub);
  }

  @Post(':id/fund')
  @Roles(Role.CLIENT)
  @ApiOperation({ summary: 'Fund escrow to start project [CLIENT]' })
  @ApiResponse({ status: 400, description: 'Insufficient balance or already funded.' })
  fundEscrow(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.contractsService.fundEscrow(id, user.sub);
  }

  @Post(':id/submit')
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: 'Submit deliverable [STUDENT]' })
  submitDeliverable(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: SubmitDeliverableDto,
  ) {
    return this.contractsService.submitDeliverable(id, user.sub, dto);
  }

  @Post(':id/approve')
  @Roles(Role.CLIENT)
  @ApiOperation({ summary: 'Approve deliverable and release escrow [CLIENT]' })
  approveAndRelease(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: ApproveDeliverableDto,
  ) {
    return this.contractsService.approveAndRelease(id, user.sub, dto);
  }

  @Post(':id/dispute')
  @Roles(Role.STUDENT, Role.CLIENT)
  @ApiOperation({ summary: 'File a dispute on an active contract [STUDENT/CLIENT]' })
  fileDispute(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: FileDisputeDto,
  ) {
    return this.contractsService.fileDispute(id, user.sub, dto.reason, dto.evidence);
  }
}
