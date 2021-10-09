import { BeforeInsert, BeforeUpdate, Column, Entity, Index, ManyToMany, OneToMany } from "typeorm";
import { BaseEntity } from "./base.entity";
import * as bcrypt from "bcrypt";
import { TaskResponses } from "./taskResponses.entity";
import { Task } from "./task.entity";
import { Portfolio } from "./portfolio.entity";
import { Message } from "./message.entity";
import { ChatRoom } from "./chat-room.entity";


@Entity("executor")
export class Executor extends BaseEntity {

  @Column({ nullable: true })
  @Index({ fulltext: true })
  fio: string;

  @Column({ type: "varchar", nullable: true })
  phone: string;

  @Column({ nullable: true })
  login: string;

  @Column("simple-json", { nullable: true })
  avatar: { name: string, url: string };

  @Column({ nullable: true })
  email: string;

  @Column({ select: false, nullable: true })
  password: string;

  @BeforeInsert()
  async generatePasswordHash(): Promise<void> {
    this.password = await bcrypt.hashSync(this.password, bcrypt.genSaltSync(this.salt));
  }

  @BeforeUpdate()
  async generatePasswordHashUpdate(): Promise<void> {
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

  @Column("simple-json", { nullable: true })
  p_scan: { name: string, url: string };

  @Column("simple-json", { nullable: true })
  p_pink: { name: string, url: string };

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

  @Column({ type: "boolean", default: false, select: false })
  banned: Boolean;

  @Column({ type: "boolean", default: false })
  verified: Boolean;

  @OneToMany(type => Message, c => c.chat)
  messages: Message[];

  @ManyToMany(type => ChatRoom, c => c.executors)
  rooms?: ChatRoom[];
}