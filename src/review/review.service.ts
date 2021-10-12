import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Review } from "../database/entities/review.entity";
import { Repository } from "typeorm";
import { CreateReviewDto } from "./dto/create-review.dto";
import { Executor } from "../database/entities/executor.entity";
import { CommentExecutor } from "../database/entities/comment.entity";
import { CreateCommentDto } from "./dto/create-comment.dto";

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review) private readonly review: Repository<Review>,
    @InjectRepository(Executor) private readonly executor: Repository<Executor>,
    @InjectRepository(CommentExecutor) private readonly comment: Repository<CommentExecutor>
  ) {
  }

  async saveOne(createReviewDto: CreateReviewDto, user): Promise<Review> {
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
        error: "Вы уже осталвляли отзыв исполнителю"
      }, HttpStatus.CONFLICT);

    const executor = await this.executor.createQueryBuilder("e")
      .select(["e.id", "r.id", "r.rating"])
      .leftJoin("e.reviews", "r")
      .loadRelationCountAndMap("r.reviewsCount", "e.reviews", "reviewsCount")
      .getOne();

    executor.reviews.forEach((i) => {
      rating += i.rating;
    });

    // @ts-ignore
    await this.executor.update(createReviewDto.executor, { rating: rating / executor?.reviewsCount });

    Object.assign(createReviewDto, { customer: user.id });
    return await this.review.save(this.review.create(createReviewDto));
  }


  async saveReviewComment(createCommentDto: CreateCommentDto, user): Promise<CommentExecutor> {
    return await this.comment.save(this.comment.create(createCommentDto));

  }

}
