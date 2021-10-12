import { Column, Entity, ManyToOne } from "typeorm";
import { BaseEntity } from "./base.entity";
import { Customer } from "./customer.entity";
import { Executor } from "./executor.entity";


@Entity("mail")
export class Mail extends BaseEntity {

  @Column({ nullable: true })
  fio: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true, type: "varchar" })
  theme: string;

  @Column({ nullable: true, type: "varchar", length: 1500 })
  text: string;

  @Column("simple-json", { default: null })
  files: { name: string, url: string }[];

  @ManyToOne(type => Customer, c => c.forms, { onDelete: "SET NULL" })
  customer: Customer;

  @ManyToOne(type => Executor, c => c.forms, { onDelete: "SET NULL" })
  executor: Executor;

}