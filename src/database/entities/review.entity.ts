import { Column, Entity, ManyToOne, OneToMany } from "typeorm";
import { BaseEntity } from "./base.entity";
import { Executor } from "./executor.entity";
import { Task } from "./task.entity";
import { Customer } from "./customer.entity";
import { CommentExecutor } from "./comment.entity";


@Entity("review")
export class Review extends BaseEntity {

  @Column({ nullable: true })
  comment: string;

  @Column({ default: 0 })
  rating: number;

  @ManyToOne(type => Executor, e => e.reviews, { onDelete: "CASCADE" })
  executor: Executor;

  @ManyToOne(type => Customer, e => e.reviews, { onDelete: "CASCADE" })
  customer: Customer;

  @ManyToOne(type => Task, e => e.reviews, { onDelete: "CASCADE" })
  task: Task;

  @OneToMany(type => CommentExecutor, c => c.review)
  comments: CommentExecutor[];
}