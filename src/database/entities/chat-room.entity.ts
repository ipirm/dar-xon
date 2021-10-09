import { Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne } from "typeorm";
import { BaseEntity } from "./base.entity";
import { Task } from "./task.entity";
import { Customer } from "./customer.entity";
import { Executor } from "./executor.entity";
import { Message } from "./message.entity";


@Entity("chat_room")
export class ChatRoom extends BaseEntity {

  @ManyToOne(type => Task, c => c.rooms, { onDelete: "SET NULL" })
  task: Task;

  @OneToOne(() => Customer)
  @JoinColumn()
  customer: Customer;

  @ManyToMany(() => Executor, c => c.rooms)
  @JoinTable()
  executors: Executor[];

  @OneToMany(type => Message, c => c.chat)
  messages: Message[];



}