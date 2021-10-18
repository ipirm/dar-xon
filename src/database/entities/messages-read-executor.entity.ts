import { Column, Entity, ManyToOne } from "typeorm";
import { BaseEntity } from "./base.entity";
import { Message } from "./message.entity";
import { Executor } from "./executor.entity";


@Entity("message-read-executor")
export class MessagesReadExecutor extends BaseEntity {

  @ManyToOne(type => Message, u => u.read_by_executors)
  message: Message;

  @ManyToOne(type => Executor, c => c.readBy)
  executor: Executor;

  @Column({ type: "boolean", default: false })
  read: boolean;

}