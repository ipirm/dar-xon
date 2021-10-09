import { BeforeInsert, BeforeUpdate, Column, Entity, Index, OneToMany } from "typeorm";
import { BaseEntity } from "./base.entity";
import { CustomerTypeEnum } from "../../enums/customerType.enum";
import * as bcrypt from "bcrypt";
import { Task } from "./task.entity";
import { Message } from "./message.entity";

@Entity("customer")
export class Customer extends BaseEntity {

  @Column({ nullable: true })
  @Index({ fulltext: true })
  fio: string;

  @Column({ nullable: true })
  email: string;

  @Column("simple-json",{ nullable: true })
  avatar: { name: string, url: string };

  @Column({ nullable: true })
  login: string;

  @Column({ type: "varchar", nullable: true })
  phone: string;

  @Column({ nullable: true, select: false })
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

  @Column({ nullable: true })
  company_name: string;

  @Column({ nullable: true })
  company_address: string;

  @Column({ nullable: true })
  inn: string;

  @Column({ nullable: true })
  bik: string;

  @Column({ nullable: true })
  ogrn: string;

  @Column({ nullable: true })
  сhecking_account: string;

  @Column({ nullable: true })
  bank_name: string;

  @Column({ nullable: true })
  corporate_account: string;

  @Column({ nullable: true })
  snils: string;

  @Column({ nullable: true })
  site: string;

  @Column("simple-json", { default: null })
  files: { name: string, url: string }[];

  @Column("enum", { enum: CustomerTypeEnum, default: CustomerTypeEnum.SelfEmployed })
  customer_type: CustomerTypeEnum;

  @Column({ default: "123456", select: false })
  confirmation: string;

  @Column({ default: false, select: false })
  confirmed: Boolean;

  @OneToMany(() => Task, c => c.created_by)
  tasks: Task[];

  @Column({ type: "boolean", default: false, select: false })
  banned: Boolean;

  @Column({ type: "boolean", default: false })
  verified: Boolean;

  @OneToMany(type => Message, c => c.chat)
  messages: Message[];

}