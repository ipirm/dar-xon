import { Column, Entity, OneToMany } from "typeorm";
import { BaseEntity } from "./base.entity";
import { CriteriaItem } from "./criteria-item.entity";


@Entity("criteria")
export class Criteria extends BaseEntity {

  @Column({ nullable: true })
  name: string;

  @OneToMany(type => CriteriaItem, t => t.criteria)
  items: Criteria[];
}