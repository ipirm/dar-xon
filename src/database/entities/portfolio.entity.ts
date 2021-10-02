import { Column, Entity, Index, ManyToOne } from "typeorm";
import { BaseEntity } from "./base.entity";
import { Category } from "./category.entity";
import { Executor } from "./executor.entity";


@Entity("portfolio")
export class Portfolio extends BaseEntity {

  @Column({ nullable: true })
  @Index({ fulltext: true })
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  image: string;

  @Column({ nullable: true })
  company_name: string;

  @Column({ nullable: true })
  site: string;

  @Column({ nullable: true })
  finishedAt: Date;

  @Column("simple-json", { default: null })
  files: { url: string }[];

  @ManyToOne(type => Category, category => category.portfolio)
  category: Category;

  @ManyToOne(type => Executor, c => c.portfolios)
  executor: Executor;

}