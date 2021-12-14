import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiCreatedResponse, ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";
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
import { ApiImplicitQuery } from "@nestjs/swagger/dist/decorators/api-implicit-query.decorator";
import { Pagination } from "nestjs-typeorm-paginate";
import { DeleteResult } from "typeorm";


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

  @Get(":id")
  @ApiOperation({ summary: "Получить отзыв по id исполнителя" })
  @ApiParam({
    name: "id",
    required: false,
    type: Number,
    description: "İd исполнителя"
  })
  @ApiImplicitQuery({
    name: "with_comment",
    required: false,
    type: Boolean,
    description: "С коментариями"
  })
  @ApiImplicitQuery({
    name: "task",
    required: false,
    type: Number,
    description: "İd задачи"
  })
  @ApiImplicitQuery({
    name: "page",
    required: false,
    type: Number
  })
  @ApiImplicitQuery({
    name: "limit",
    required: false,
    type: Number
  })
  getOne(
    @Query("page") page: number = 1,
    @Query("limit") limit: number = 100,
    @Param("id") id: number,
    @Query("with_comment") with_comment: boolean,
    @Query("task") task: number
  ): Promise<Pagination<Review>> {
    return this.review.findOne(page, limit, id, with_comment, task);
  }

  @ApiBearerAuth()
  @hasRoles(Role.Customer)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get("check/review")
  @ApiOperation({ summary: "Проверить наличие отзыва от заказчика" })
  checkForReview(
    @Query("executor") executor: number,
    @UserDecorator() user: any
  ): Promise<Review> {
    return this.review.checkForReview(executor, user);
  }


  @ApiBearerAuth()
  @hasRoles(Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get("")
  @ApiOperation({ summary: "Получить все отзывы" })
  @ApiImplicitQuery({
    name: "page",
    required: false,
    type: Number
  })
  @ApiImplicitQuery({
    name: "limit",
    required: false,
    type: Number
  })
  @ApiImplicitQuery({
    name: "with_comment",
    required: false,
    type: Boolean,
    example: false
  })
  getReviews(
    @Query("with_comment") withComment: boolean,
    @Query("page") page: number = 1,
    @Query("limit") limit: number = 100
  ): Promise<Pagination<Review>> {
    return this.review.getReviews(withComment, page, limit);
  }

  @ApiBearerAuth()
  @hasRoles(Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete("review/:id")
  @ApiOperation({ summary: "Удалить отзыв" })
  @ApiParam({
    name: "id",
    type: Number
  })
  deleteReview(
    @Param("id") id: number
  ): Promise<DeleteResult> {
    return this.review.deleteReview(id);
  }

  @ApiBearerAuth()
  @hasRoles(Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete("comment/:id")
  @ApiOperation({ summary: "Удалить коментарий" })
  deleteComment(
    @Param("id") id: number
  ): Promise<DeleteResult> {
    return this.review.deleteComment(id);
  }

}
