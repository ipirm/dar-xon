import { BeforeUpdate, Column, Entity, OneToMany } from "typeorm";
import { BaseEntity } from "./base.entity";
import * as bcrypt from "bcrypt";
import { TaskResponses } from "./taskResponses.entity";
import { Task } from "./task.entity";


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

  @Column({ select: true, nullable: true })
  password: string;

  @BeforeUpdate()
  async generatePasswordHash(): Promise<void> {
    this.password = await bcrypt.hashSync(this.password, bcrypt.genSaltSync(this.salt));
  }

  @Column({ type: "integer", default: 10, select: false })
  salt: number;

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

  @OneToMany(type => TaskResponses, task => task.executor)
  responses?: TaskResponses[];

  @OneToMany(() => Task, c => c.executor)
  tasks: Task[];
}