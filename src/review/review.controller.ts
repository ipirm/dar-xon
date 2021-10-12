import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiCreatedResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { ReviewService } from "./review.service";
import { Review } from "../database/entities/review.entity";
import { CreateReviewDto } from "./dto/create-review.dto";
import { hasRoles } from "../decorators/roles.decorator";
import { Role } from "../enums/roles.enum";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { UserDecorator } from "../decorators/user.decorator";
import { CreateCommentDto } from "./dto/create-comment.dto";
import { CommentExecutor } from "../database/entities/comment.entity";


@ApiTags("Review")
@Controller("review")
export class ReviewController {
  constructor(private readonly review: ReviewService) {
  }


  @ApiBearerAuth()
  @hasRoles(Role.Customer)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post("review")
  @ApiOperation({ summary: "Оставить отзыв исполнителю" })
  @ApiCreatedResponse({ type: CreateReviewDto })
  saveReview(
    @Body() createReviewDto: CreateReviewDto,
    @UserDecorator() user: any
  ): Promise<Review> {
    return this.review.saveOne(createReviewDto, user);
  }

  @ApiBearerAuth()
  @hasRoles(Role.Executor)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post("comment")
  @ApiOperation({ summary: "Оставить коментарий на отзыв" })
  @ApiCreatedResponse({ type: CreateCommentDto })
  saveReviewComment(
    @Body() createCommentDto: CreateCommentDto,
    @UserDecorator() user: any
  ): Promise<CommentExecutor> {
    return this.review.saveReviewComment(createCommentDto, user);
  }
}
