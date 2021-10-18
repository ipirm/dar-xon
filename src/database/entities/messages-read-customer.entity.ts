import { Column, Entity, ManyToOne } from "typeorm";
import { BaseEntity } from "./base.entity";
import { Message } from "./message.entity";
import { Customer } from "./customer.entity";


@Entity("message-read-customer")
export class MessagesReadCustomer extends BaseEntity {

  @ManyToOne(type => Message, u => u.read_by_customers)
  message: Message;

  @ManyToOne(type => Customer, c => c.readBy)
  customer: Customer;

  @Column({ type: "boolean", default: false })
  read: boolean;

}