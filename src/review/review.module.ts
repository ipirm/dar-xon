import { Module } from "@nestjs/common";
import { ReviewService } from "./review.service";
import { ReviewController } from "./review.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Review } from "../database/entities/review.entity";
import { Executor } from "../database/entities/executor.entity";
import { CommentExecutor } from "../database/entities/comment.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([Review, Executor, CommentExecutor])
  ],
  providers: [ReviewService],
  controllers: [ReviewController]
})
export class ReviewModule {
}
