import { Column, Entity, Index, ManyToOne } from "typeorm";
import { BaseEntity } from "./base.entity";
import { Category } from "./category.entity";
import { Executor } from "./executor.entity";
import { TaskTypes } from "./task-types.entity";


@Entity("portfolio")
export class Portfolio extends BaseEntity {

  @Column({ nullable: true })
  @Index({ fulltext: true })
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column("simple-json", { default: null })
  image: { name: string, url: string };

  @Column("simple-json", { default: null })
  logo: { name: string, url: string };

  @Column({ nullable: true })
  company_name: string;

  @Column({ nullable: true })
  site: string;

  @Column({ nullable: true })
  finishedAt: Date;

  @Column("simple-json", { default: null })
  files: { name: string, url: string }[];

  @ManyToOne(type => Category, c => c.portfolio, { onDelete: "SET NULL" })
  category: Category;

  @ManyToOne(type => Executor, c => c.portfolios)
  executor: Executor;

  @ManyToOne(type => TaskTypes, c => c.portfolios, { onDelete: "SET NULL" })
  cat_type: TaskTypes;

}