import { Controller, Get, Patch, Param, Body, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';

@ApiTags('users')
@ApiBearerAuth('JWT')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile details' })
  getMe(@CurrentUser() user: JwtPayload) {
    return this.usersService.findById(user.sub);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search active users by name or email' })
  searchUsers(
    @CurrentUser() user: JwtPayload,
    @Query('q') q: string
  ) {
    return this.usersService.searchUsers(q, user.sub);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update current user profile' })
  updateProfile(
    @CurrentUser() user: JwtPayload,
    @Body() body: any
  ) {
    return this.usersService.updateProfile(user.sub, body);
  }

  @Patch('me/avatar')
  @ApiOperation({ summary: 'Update current user avatar' })
  updateAvatar(
    @CurrentUser() user: JwtPayload,
    @Body('avatarUrl') avatarUrl: string
  ) {
    return this.usersService.updateAvatar(user.sub, avatarUrl);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  getUser(@Param('id', ParseUUIDPipe) id: string) {
    return this.usersService.findById(id);
  }
}
