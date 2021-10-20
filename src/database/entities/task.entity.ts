import { Column, Entity, Index, JoinTable, ManyToMany, ManyToOne, OneToMany } from "typeorm";
import { BaseEntity } from "./base.entity";
import { Customer } from "./customer.entity";
import { TaskResponses } from "./taskResponses.entity";
import { Category } from "./category.entity";
import { Executor } from "./executor.entity";
import { TaskStatusEnum } from "../../enums/taskStatus.enum";
import { CriteriaItem } from "./criteria-item.entity";
import { TaskTypes } from "./task-types.entity";
import { ChatRoom } from "./chat-room.entity";
import { Review } from "./review.entity";


@Entity("task")
export class Task extends BaseEntity {

  @Column({ nullable: true })
  @Index({ fulltext: true })
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  site: string;

  @Column({ default: 0 })
  participants: number;

  @Column({ nullable: true })
  startedAt: Date;

  @Column({ nullable: true })
  finishedAt: Date;

  @Column("simple-json", { default: null })
  files: { name: string, url: string }[];

  @ManyToOne(() => Customer, c => c.tasks, { onDelete: "SET NULL" })
  created_by: Customer;

  @OneToMany(type => TaskResponses, t => t.task)
  responses: TaskResponses[];

  @ManyToOne(type => Category, category => category.tasks, { onDelete: "SET NULL" })
  category: Category;

  @ManyToMany(() => Executor, c => c.tasks)
  @JoinTable()
  executors: Executor[];

  @Column("enum", { enum: TaskStatusEnum, default: TaskStatusEnum.Created })
  status: TaskStatusEnum;

  @ManyToMany(() => CriteriaItem, c => c.tasks)
  @JoinTable()
  criteria: CriteriaItem[];

  @ManyToOne(type => TaskTypes, c => c.tasks, { onDelete: "SET NULL" })
  task_type: TaskTypes;

  @OneToMany(type => TaskResponses, t => t.task)
  rooms: ChatRoom[];

  @OneToMany(type => Review, c => c.executor)
  reviews: Review[];

}