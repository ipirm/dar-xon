import { Column, Entity, ManyToOne, OneToMany } from "typeorm";
import { BaseEntity } from "./base.entity";
import { ChatRoom } from "./chat-room.entity";
import { Executor } from "./executor.entity";
import { Customer } from "./customer.entity";
import { MessageType } from "../../enums/messageType";
import { MessagesReadExecutor } from "./messages-read-executor.entity";
import { MessagesReadCustomer } from "./messages-read-customer.entity";


@Entity("message")
export class Message extends BaseEntity {

  @ManyToOne(type => ChatRoom, c => c.messages, { onDelete: "CASCADE" })
  chat: ChatRoom;

  @Column({ nullable: true })
  text: string;

  @Column("simple-json", { default: null })
  file: { name: string, url: string };

  @ManyToOne(type => Executor, c => c.messages, { onDelete: "CASCADE" })
  executor: Executor;

  @ManyToOne(type => Customer, c => c.messages, { onDelete: "CASCADE" })
  customer: Customer;

  @OneToMany(type => MessagesReadCustomer, e => e.message)
  read_by_customers?: MessagesReadCustomer[];

  @OneToMany(type => MessagesReadExecutor, e => e.message)
  read_by_executors?: MessagesReadExecutor[];

  @Column("enum", { enum: MessageType, default: MessageType.Text })
  m_type: MessageType;
}