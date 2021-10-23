import { BeforeInsert, BeforeUpdate, Column, Entity, Index, ManyToMany, OneToMany } from "typeorm";
import { BaseEntity } from "./base.entity";
import * as bcrypt from "bcrypt";
import { TaskResponses } from "./taskResponses.entity";
import { Task } from "./task.entity";
import { Portfolio } from "./portfolio.entity";
import { Message } from "./message.entity";
import { ChatRoom } from "./chat-room.entity";
import { Review } from "./review.entity";
import { Mail } from "./mail.entity";
import { MessagesReadExecutor } from "./messages-read-executor.entity";

@Entity("executor")
export class Executor extends BaseEntity {

  @Column({ nullable: true })
  @Index({ fulltext: true })
  fio: string;

  @Column({ type: "varchar", nullable: true })
  phone: string;

  @Column({ nullable: true })
  about: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  passport_series: string;

  @Column({ nullable: true })
  passport_number: string;

  @Column({ nullable: true })
  passport_issuer: string;

  @Column({ nullable: true })
  passport_issued_at: string;

  @Column({ nullable: true })
  birthdate: string;

  @Column("simple-json", { nullable: true })
  file_rose_ticket: { name: string, url: string };

  @Column("simple-json", { nullable: true })
  file_passport: { name: string, url: string };

  @Column("simple-json", { nullable: true })
  file_passport_2: { name: string, url: string };

  @Column({ nullable: true })
  login: string;

  @Column("simple-json", { nullable: true })
  avatar: { name: string, url: string };

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  site: string;

  @Column({ type: "numeric", default: 5 })
  rating: number;

  @Column({ select: false, nullable: true })
  password: string;

  @BeforeInsert()
  async generatePasswordHash(): Promise<void> {
    this.password = await bcrypt.hashSync(this.password, bcrypt.genSaltSync(this.salt));
  }

  @BeforeUpdate()
  async generatePasswordHashUpdate(): Promise<void> {
    if(this.password !== this.password)
      this.password = await bcrypt.hashSync(this.password, bcrypt.genSaltSync(this.salt));
  }

  @Column({ type: "integer", default: 10, select: false })
  salt: number;

  @Column({ default: "123456", select: false })
  confirmation_email: string;

  @Column({ default: false, select: false })
  confirmed_email: Boolean;

  @Column({ default: "123456", select: false })
  confirmation_phone: string;

  @Column({ default: false, select: false })
  confirmed_phone: Boolean;

  @OneToMany(type => TaskResponses, t => t.executor, { cascade: true })
  responses?: TaskResponses[];

  @ManyToMany(() => Task, c => c.executors, { cascade: true })
  tasks: Task[];

  @OneToMany(type => Portfolio, t => t.executor)
  portfolios?: Portfolio[];

  @Column({ type: "boolean", default: false, select: false })
  banned: Boolean;

  @Column({ type: "boolean", default: false })
  verified: Boolean;

  @OneToMany(type => Review, c => c.executor)
  reviews: Review[];

  @OneToMany(type => Message, c => c.chat)
  messages: Message[];

  @ManyToMany(type => ChatRoom, c => c.executors)
  rooms?: ChatRoom[];

  @Column({ type: "boolean", default: false })
  online: Boolean;

  @OneToMany(type => Mail, t => t.executor)
  forms: Mail[];

  @Column({ nullable: true })
  city: string;

  @Column({
    nullable: true,
    select: false
  })
  public currentHashedRefreshToken?: string;

  @OneToMany(() => MessagesReadExecutor, c => c.executor)
  readBy?: MessagesReadExecutor[];

}