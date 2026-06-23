import { Controller, Get, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SkillsService } from './skills.service';
import { CreateSkillDto } from './dto/skill.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Role } from '@prisma/client';

@ApiTags('skills')
@Controller('skills')
export class SkillsController {
  constructor(private readonly skillsService: SkillsService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'List all available skills' })
  findAll() {
    return this.skillsService.findAll();
  }

  @Public()
  @Get('stats')
  @ApiOperation({ summary: 'List skills with usage statistics' })
  getSkillsWithStats() {
    return this.skillsService.getSkillsWithStats();
  }

  @Post()
  @ApiBearerAuth('JWT')
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Create a new skill [ADMIN]' })
  createSkill(@Body() dto: CreateSkillDto) {
    return this.skillsService.findOrCreate(dto.name, dto.category);
  }
}
