import { Column, Entity, ManyToOne } from "typeorm";
import { BaseEntity } from "./base.entity";
import { Review } from "./review.entity";


@Entity("comment")
export class CommentExecutor extends BaseEntity {

  @Column({ nullable: true })
  comment: string;

  @ManyToOne(type => Review, e => e.comment, { onDelete: "CASCADE" })
  review: Review;


}