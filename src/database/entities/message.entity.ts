import { Column, Entity, JoinTable, ManyToMany, ManyToOne } from "typeorm";
import { BaseEntity } from "./base.entity";
import { ChatRoom } from "./chat-room.entity";
import { Executor } from "./executor.entity";
import { Customer } from "./customer.entity";


@Entity("message")
export class Message extends BaseEntity {

  @ManyToOne(type => ChatRoom, c => c.messages, { onDelete: "SET NULL" })
  chat: ChatRoom;

  @Column()
  text: string;

  @ManyToOne(type => Executor, c => c.messages, { onDelete: "SET NULL" })
  executor: Executor;

  @ManyToOne(type => Customer, c => c.messages, { onDelete: "SET NULL" })
  customer: Customer;

  @ManyToMany(type => Customer,e=>e.readBy)
  @JoinTable()
  read_by_customer?: Customer[];

  @ManyToMany(type => Executor,e=>e.readBy)
  @JoinTable()
  read_by_executors?: Executor[];


}