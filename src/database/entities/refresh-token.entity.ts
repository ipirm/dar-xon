import { Column, Entity, ManyToOne } from "typeorm";
import { BaseEntity } from "./base.entity";
import { Executor } from "./executor.entity";
import { Customer } from "./customer.entity";


@Entity("refresh_tokens")

export class RefreshToken extends BaseEntity {

  @Column({nullable:true})
  token: string;

  @Column({ default: false })
  is_revoked: boolean;

  @Column({ nullable: true })
  expires: Date;

  @ManyToOne(type => Executor, c => c.refresh_tokens)
  executor: Executor;

  @ManyToOne(type => Customer, c => c.refresh_tokens)
  customer: Customer;
}