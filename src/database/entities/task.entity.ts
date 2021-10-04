import { Column, Entity, Index, JoinTable, ManyToMany, ManyToOne, OneToMany } from "typeorm";
import { BaseEntity } from "./base.entity";
import { Customer } from "./customer.entity";
import { TaskResponses } from "./taskResponses.entity";
import { Category } from "./category.entity";
import { Executor } from "./executor.entity";
import { TaskStatusEnum } from "../../enums/taskStatus.enum";


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
  files: { url: string }[];

  @ManyToOne(() => Customer, c => c.tasks, { onDelete: "CASCADE" })
  created_by: Customer;

  @OneToMany(type => TaskResponses, t => t.task)
  responses: TaskResponses[];

  @ManyToOne(type => Category, category => category.tasks, { onDelete: "CASCADE" })
  category: Category;

  @ManyToMany(() => Executor, c => c.tasks, { onDelete: "CASCADE" })
  @JoinTable()
  executors: Executor[];

  @Column("enum", { enum: TaskStatusEnum, default: TaskStatusEnum.Created })
  status: TaskStatusEnum;

}