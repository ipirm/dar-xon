import { Column, Entity, OneToMany, Tree, TreeChildren, TreeParent } from "typeorm";
import { BaseEntity } from "./base.entity";
import { Task } from "./task.entity";
import { Portfolio } from "./portfolio.entity";
import { TaskTypes } from "./task-types.entity";


@Entity("categories")
@Tree("closure-table")
export class Category extends BaseEntity {

  @Column({ nullable: true })
  name: string;

  @TreeChildren()
  children: Category[];

  @TreeParent({onDelete: "SET NULL"})
  parent: Category;

  @OneToMany(type => Task, t => t.category)
  tasks?: Task[];

  @OneToMany(type => Portfolio, t => t.category)
  portfolio: Portfolio[];

  @OneToMany(type => TaskTypes, t => t.category)
  task_types: TaskTypes[];

}