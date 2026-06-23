import { Controller, Post, Get, Param, Body, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/review.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('reviews')
@ApiBearerAuth('JWT')
@Controller()
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post('contracts/:contractId/reviews')
  @ApiOperation({ summary: 'Create a review for a contract' })
  createReview(
    @Param('contractId', ParseUUIDPipe) contractId: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: CreateReviewDto
  ) {
    return this.reviewsService.createReview(user.sub, contractId, dto);
  }

  @Public()
  @Get('students/:studentId/reviews')
  @ApiOperation({ summary: 'Get public reviews for a student' })
  getStudentReviews(@Param('studentId', ParseUUIDPipe) studentId: string) {
    return this.reviewsService.getStudentReviews(studentId);
  }
}
