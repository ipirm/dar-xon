import { Column, Entity, OneToMany, Tree, TreeChildren, TreeParent } from "typeorm";
import { BaseEntity } from "./base.entity";
import { Task } from "./task.entity";
import { Portfolio } from "./portfolio.entity";


@Entity("categories")
@Tree("closure-table")
export class Category extends BaseEntity {

  @Column({ nullable: true })
  name: string;

  @TreeChildren()
  children: Category[];

  @TreeParent()
  parent: Category;

  @OneToMany(type => Task, t => t.category, { onDelete: "CASCADE" })
  tasks?: Task[];

  @OneToMany(type => Portfolio, t => t.category)
  portfolio: Portfolio[];

}