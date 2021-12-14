import { Column, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany } from "typeorm";
import { BaseEntity } from "./base.entity";
import { Task } from "./task.entity";
import { Customer } from "./customer.entity";
import { Executor } from "./executor.entity";
import { Message } from "./message.entity";
import { ChatStatus } from "../../enums/chatStatus";


@Entity("chat_room")
export class ChatRoom extends BaseEntity {

  @ManyToOne(type => Task, c => c.rooms, { onDelete: "CASCADE" })
  task: Task;

  @ManyToOne(type => Customer, c => c.chats, { onDelete: "SET NULL" })
  customer: Customer;

  @ManyToMany(() => Executor, c => c.rooms)
  @JoinTable()
  executors: Executor[];

  @OneToMany(type => Message, c => c.chat)
  messages: Message[];

  @Column("enum", { enum: ChatStatus, default: ChatStatus.Active })
  status: ChatStatus;

  @Column("boolean", { default: false })
  entrance: boolean;
}
