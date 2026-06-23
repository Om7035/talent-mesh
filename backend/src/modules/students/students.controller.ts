import { Controller, Get, Post, Patch, Delete, Body, Param, Query, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { StudentsService } from './students.service';
import { UpdateStudentProfileDto, AddSkillDto, AddCertificationDto, StudentSearchDto } from './dto/student.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { Role } from '@prisma/client';

@ApiTags('students')
@ApiBearerAuth('JWT')
@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current student profile' })
  getMyProfile(@CurrentUser() user: JwtPayload) {
    return this.studentsService.getProfile(user.sub);
  }

  @Public()
  @Get('search')
  @ApiOperation({ summary: 'Search students' })
  searchStudents(@Query() query: StudentSearchDto) {
    return this.studentsService.searchStudents(query);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get student profile by ID' })
  async getProfile(@Param('id', ParseUUIDPipe) id: string) {
    const profile = await this.studentsService.getProfile(id);
    await this.studentsService.incrementProfileViews(id);
    return profile;
  }

  @Patch('me')
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: 'Update profile' })
  updateProfile(@CurrentUser() user: JwtPayload, @Body() dto: UpdateStudentProfileDto) {
    return this.studentsService.updateProfile(user.sub, dto);
  }

  @Post('me/skills')
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: 'Add a skill' })
  addSkill(@CurrentUser() user: JwtPayload, @Body() dto: AddSkillDto) {
    return this.studentsService.addSkill(user.sub, dto);
  }

  @Delete('me/skills/:skillId')
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: 'Remove a skill' })
  removeSkill(@CurrentUser() user: JwtPayload, @Param('skillId', ParseUUIDPipe) skillId: string) {
    return this.studentsService.removeSkill(user.sub, skillId);
  }

  @Post('me/certifications')
  @Roles(Role.STUDENT)
  @ApiOperation({ summary: 'Add a certification' })
  addCertification(@CurrentUser() user: JwtPayload, @Body() dto: AddCertificationDto) {
    return this.studentsService.addCertification(user.sub, dto);
  }

  @Public()
  @Get(':id/portfolio')
  @ApiOperation({ summary: 'Get student portfolio (completed contracts)' })
  getPortfolio(@Param('id', ParseUUIDPipe) id: string) {
    return this.studentsService.getPortfolio(id);
  }

  @Post(':id/verify')
  @Roles(Role.TPO, Role.ADMIN)
  @ApiOperation({ summary: 'Verify a student (TPO/Admin)' })
  verifyStudent(@CurrentUser() user: JwtPayload, @Param('id', ParseUUIDPipe) id: string) {
    return this.studentsService.verifyStudent(id, user.sub);
  }
}
