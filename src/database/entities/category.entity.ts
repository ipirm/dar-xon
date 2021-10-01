import { Column, Entity, ManyToOne, OneToMany } from "typeorm";
import { BaseEntity } from "./base.entity";
import { Task } from "./task.entity";


@Entity("category")

export class Category extends BaseEntity {

  @Column({ nullable: true })
  name: string;

  @ManyToOne(type => Category, category => category.children, { onDelete: "CASCADE" })
  parent?: Category;

  @OneToMany(type => Category, category => category.parent, { cascade: true })
  children?: Category[];

  @OneToMany(type => Task, t => t.category, { onDelete: "CASCADE" })
  tasks?: Task[];

}