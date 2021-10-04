import { BeforeUpdate, Column, Entity, ManyToMany, OneToMany } from "typeorm";
import { BaseEntity } from "./base.entity";
import * as bcrypt from "bcrypt";
import { TaskResponses } from "./taskResponses.entity";
import { Task } from "./task.entity";
import { Portfolio } from "./portfolio.entity";


@Entity("executor")
export class Executor extends BaseEntity {

  @Column({ nullable: true })
  fio: string;

  @Column({ type: "varchar", nullable: true })
  phone: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ nullable: true })
  email: string;

  @Column({ select: false, nullable: true })
  password: string;

  @BeforeUpdate()
  async generatePasswordHash(): Promise<void> {
    this.password = await bcrypt.hashSync(this.password, bcrypt.genSaltSync(this.salt));
  }

  @Column({ type: "integer", default: 10, select: false })
  salt: number;

  @Column({ type: "integer", default: 5 })
  rating: number;

  @Column({ nullable: true })
  p_series: string;

  @Column({ nullable: true })
  p_number: string;

  @Column({ nullable: true })
  p_by: string;

  @Column({ nullable: true })
  p_issue_time: string;

  @Column({ nullable: true })
  p_birth_date: string;

  @Column({nullable: true})
  p_scan: string;

  @Column({nullable: true})
  p_pink: string;

  @Column({ default: "123456", select: false })
  confirmation: string;

  @Column({ default: false, select: false })
  confirmed: Boolean;

  @OneToMany(type => TaskResponses, t => t.executor)
  responses?: TaskResponses[];

  @ManyToMany(() => Task, c => c.executors)
  tasks: Task[];

  @OneToMany(type => Portfolio, t => t.executor)
  portfolios?: Portfolio[];
}