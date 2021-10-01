import { Column, Entity, ManyToOne } from "typeorm";
import { BaseEntity } from "./base.entity";
import { Executor } from "./executor.entity";
import { Task } from "./task.entity";


@Entity("task_response")
export class TaskResponses extends BaseEntity {

  @Column({ nullable: true })
  comment: string;

  @ManyToOne(type => Executor, e => e.responses, { onDelete: "CASCADE" })
  executor: Executor;

  @ManyToOne(type => Task, t => t.responses, { onDelete: "CASCADE" })
  task: Task;
}