import { Column, Entity, ManyToMany, ManyToOne } from "typeorm";
import { BaseEntity } from "./base.entity";
import { Criteria } from "./criteria.entity";
import { Task } from "./task.entity";


@Entity("criteria-item")
export class CriteriaItem extends BaseEntity {

  @Column({ nullable: true })
  name: string;

  @ManyToOne(type => Criteria, e => e.items, { onDelete: "CASCADE" })
  criteria: Criteria;

  @ManyToMany(() => Task, c => c.criteria,{cascade: true})
  tasks: Task[];
}