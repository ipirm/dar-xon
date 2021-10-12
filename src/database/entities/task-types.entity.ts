import { Column, Entity, ManyToOne, OneToMany } from "typeorm";
import { BaseEntity } from "./base.entity";
import { Category } from "./category.entity";
import { Task } from "./task.entity";
import { Portfolio } from "./portfolio.entity";


@Entity("task-types")
export class TaskTypes extends BaseEntity {

  @Column({ nullable: true })
  name: string;

  @ManyToOne(type => Category, t => t.task_types, { onDelete: "SET NULL" })
  category: Category[];

  @ManyToOne(type => Task, c => c.task_type, { onDelete: "SET NULL" })
  tasks: Task[];

  @OneToMany(type => Portfolio, c => c.cat_type)
  portfolios: Portfolio[];
}