import { Column, Entity, ManyToOne } from "typeorm";
import { BaseEntity } from "./base.entity";
import { Category } from "./category.entity";
import { Task } from "./task.entity";


@Entity("task-types")
export class TaskTypes extends BaseEntity {

  @Column({ nullable: true })
  name: string;

  @ManyToOne(type => Category, t => t.task_types, { onDelete: "SET NULL" })
  category: Category[];

  @ManyToOne(type => Task, c => c.task_type, { onDelete: "SET NULL" })
  tasks: Task[];
}