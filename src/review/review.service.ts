import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Review } from "../database/entities/review.entity";
import { DeleteResult, Repository } from "typeorm";
import { CreateReviewDto } from "./dto/create-review.dto";
import { Executor } from "../database/entities/executor.entity";
import { CommentExecutor } from "../database/entities/comment.entity";
import { CreateCommentDto } from "./dto/create-comment.dto";
import { paginate, Pagination } from "nestjs-typeorm-paginate";

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review) private readonly review: Repository<Review>,
    @InjectRepository(Executor) private readonly executor: Repository<Executor>,
    @InjectRepository(CommentExecutor) private readonly comment: Repository<CommentExecutor>
  ) {
  }

  async saveOne(createReviewDto: CreateReviewDto, user): Promise<any> {
    let rating: number = 0;
    const review = await this.review.createQueryBuilder("c")
      .select(["c.id", "task.id", "executor.id", "customer.id"])
      .leftJoin("c.task", "task")
      .leftJoin("c.executor", "executor")
      .leftJoin("c.customer", "customer")
      .where("task.id = :task_id AND executor.id = :executor_id AND customer.id = :customer_id", {
        task_id: createReviewDto.task,
        executor_id: createReviewDto.executor,
        customer_id: user.id
      }).getOne();

    if (review)
      throw new HttpException({
        status: HttpStatus.CONFLICT,
        error: "Вы уже оставляли отзыв исполнителю"
      }, HttpStatus.CONFLICT);

    const executor = await this.executor.createQueryBuilder("e")
      .select(["e.id", "r.id", "r.rating"])
      .leftJoin("e.reviews", "r")
      .where("e.id = :id", { id: createReviewDto.executor })
      .loadRelationCountAndMap("r.reviewsCount", "e.reviews", "reviewsCount")
      .getOne();


    executor.reviews.forEach((i) => {
      rating += i.rating;
    });


    rating = rating + createReviewDto.rating;

    // @ts-ignore
    await this.executor.update(createReviewDto.executor, { rating: (rating / (parseInt(executor?.reviewsCount) + 1)).toFixed(1) });

    Object.assign(createReviewDto, { customer: user.id });
    console.log(createReviewDto);
    await this.review.save(createReviewDto);
    return null;
  }

  async saveReviewComment(createCommentDto: CreateCommentDto, user): Promise<CommentExecutor> {
    return await this.comment.save(this.comment.create(createCommentDto));

  }

  async findOne(page, limit, id: number, with_comment: boolean, task: number): Promise<Pagination<Review>> {
    const data = this.review.createQueryBuilder("r")
      .select(["r.id", "r.comment", "r.createdAt", "r.rating", "e.id", "e.fio", "e.avatar", "t.id", "t.title", "c.id", "c.fio", "c.avatar","c.company_name"])
      .leftJoin("r.executor", "e")
      .leftJoin("r.task", "t")
      .leftJoin("t.created_by", "c");
    if (with_comment) {
      data.leftJoinAndSelect("r.comments", "cs");
    }
    if (id) {
      data.andWhere("e.id = :id", { id: id });
    }
    if (task) {
      data.andWhere("t.id = :task", { task: task });
    }

    return await paginate(data, { page, limit });
  }

  async checkForReview(executor, user): Promise<any> {
    const review = await this.review.createQueryBuilder("r")
      .select(["r.id", "c.id", "e.id"])
      .leftJoin("r.customer", "c")
      .leftJoin("r.executor", "e")
      .andWhere("c.id = :user", { user: user.id })
      .andWhere("e.id = :executor", { executor: executor });

    if (review)
      throw new HttpException({
        status: HttpStatus.CONFLICT,
        error: "Вы уже оставляли отзыв"
      }, HttpStatus.FORBIDDEN);

    return {
      status: HttpStatus.OK,
      message: `Вы не оставляли отзыв ${executor} исполнителю`
    };
  }

  async deleteReview(id: number): Promise<DeleteResult> {
    console.log(id);
    let rating: number = 0;
    const review = await this.review.createQueryBuilder("r")
      .where("r.id = :id", { id: id })
      .leftJoinAndSelect("r.executor", "executor")
      .getOne();

    const executor = await this.executor.createQueryBuilder("e")
      .select(["e.id", "r.id", "r.rating"])
      .leftJoin("e.reviews", "r")
      .where("e.id = :id", { id: review.executor.id })
      .loadRelationCountAndMap("r.reviewsCount", "e.reviews", "reviewsCount")
      .getOne();

    executor.reviews.forEach((i) => {
      rating += i.rating;
    });

    // @ts-ignore
    await this.executor.update(executor.id, { rating: (rating - review.rating) / (parseInt(executor?.reviewsCount) - 1) });

    const comment = await this.comment.createQueryBuilder("c")
      .select(["c.id", "review.id"])
      .leftJoin("c.review", "review")
      .where("review.id = :id", { id: id })
      .getOne();

    if (comment)
      await this.comment.delete(comment.id);

    return await this.review.delete(id);
  }

  async deleteComment(id: number): Promise<DeleteResult> {
    return await this.comment.delete(id);
  }

  async getReviews(withComment, page, limit): Promise<Pagination<Review>> {
    const reviews = this.review.createQueryBuilder("r");

    if (withComment)
      reviews.leftJoinAndSelect("r.comments", "c");

    return await paginate(reviews, { page, limit });
  }

}
