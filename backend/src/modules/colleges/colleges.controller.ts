import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CollegesService } from './colleges.service';
import { CreateCollegeDto } from './dto/college.dto';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('colleges')
@Controller('colleges')
export class CollegesController {
  constructor(private readonly collegesService: CollegesService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List all colleges (for signup/registration selection)' })
  findAll() {
    return this.collegesService.findAll();
  }

  @Post()
  @ApiBearerAuth('JWT')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Add a new college [ADMIN]' })
  create(@Body() dto: CreateCollegeDto) {
    return this.collegesService.create(dto);
  }
}
