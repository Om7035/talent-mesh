import {
  Controller, Get, Post, Body, Param, ParseUUIDPipe, Query, ParseIntPipe,
  DefaultValuePipe, HttpCode, HttpStatus
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MessagingService } from './messaging.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

class CreateConversationDto {
  @IsUUID() recipientId: string;
}

class SendMessageDto {
  @IsString() @IsNotEmpty() content: string;
}

@ApiTags('messages')
@ApiBearerAuth('JWT')
@Controller('messages')
export class MessagingController {
  constructor(private readonly messagingService: MessagingService) {}

  @Get('conversations')
  @ApiOperation({ summary: 'Get all my conversations' })
  getMyConversations(@CurrentUser() user: JwtPayload) {
    return this.messagingService.getMyConversations(user.sub);
  }

  @Post('conversations')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get or create a 1:1 conversation with another user' })
  getOrCreate(@CurrentUser() user: JwtPayload, @Body() dto: CreateConversationDto) {
    return this.messagingService.getOrCreateConversation(user.sub, dto.recipientId);
  }

  @Get('conversations/:id/messages')
  @ApiOperation({ summary: 'Get messages in a conversation' })
  getMessages(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
  ) {
    return this.messagingService.getMessages(id, user.sub, 1, limit);
  }

  @Post('conversations/:id/messages')
  @ApiOperation({ summary: 'Send a message in a conversation' })
  sendMessage(
    @CurrentUser() user: JwtPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.messagingService.sendMessage(id, user.sub, dto.content);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get total unread message count' })
  getUnreadCount(@CurrentUser() user: JwtPayload) {
    return this.messagingService.getTotalUnread(user.sub);
  }
}
