import { BeforeInsert, BeforeUpdate, Column, Entity, Index, OneToMany } from "typeorm";
import { BaseEntity } from "./base.entity";
import { CustomerTypeEnum } from "../../enums/customerType.enum";
import * as bcrypt from "bcrypt";
import { Task } from "./task.entity";
import { Message } from "./message.entity";
import { Review } from "./review.entity";
import { Mail } from "./mail.entity";
import { MessagesReadCustomer } from "./messages-read-customer.entity";
import { ChatRoom } from "./chat-room.entity";

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
    if(this.password !== this.password)
    this.password = await bcrypt.hashSync(this.password, bcrypt.genSaltSync(this.salt));
  }

  @Column({ type: "integer", default: 10, select: false })
  salt: number;

  @Column({ nullable: true })
  company_name: string;

  @Column({ nullable: true })
  company_address: string;

  @Column({ nullable: true })
  company_real_address: string;



  @Column({ nullable: true })
  position: string;

  @Column({ nullable: true })
  sign: string;

  @Column({ nullable: true })
  rights_no: string;

  @Column({ nullable: true })
  rights_date: string;

  @Column({ nullable: true })
  rights_expire: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  inn: string;

  @Column({ nullable: true })
  kpp: string;

  @Column({ nullable: true })
  ogrn: string;

  @Column({ nullable: true })
  сhecking_account: string;

  @Column({ nullable: true })
  corporate_account: string;

  @Column({ nullable: true })
  bik: string;

  @Column({ nullable: true })
  bank_name: string;

  @Column({ nullable: true })
  site: string;

  @Column("simple-json", { default: null })
  files: { name: string, url: string }[];

  @Column("enum", { enum: CustomerTypeEnum, default: CustomerTypeEnum.SELF })
  customer_type: CustomerTypeEnum;

  @Column({
    nullable: true,
    select: true
  })
  public currentHashedRefreshToken?: string;

  @Column({ default: null, select: false })
  confirmation_email: string;

  @Column({ default: false })
  confirmed_email: Boolean;

  @Column({ default: null, select: false })
  confirmation_phone: string;

  @Column({ default: false })
  confirmed_phone: Boolean;

  @OneToMany(() => Task, c => c.created_by)
  tasks: Task[];

  @Column({ type: "boolean", default: false, select: false })
  banned: Boolean;

  @Column({ type: "boolean", default: false })
  verified: Boolean;

  @OneToMany(type => Message, c => c.chat)
  messages: Message[];

  @OneToMany(type => Review, c => c.customer)
  reviews: Review[];

  @Column({ type: "boolean", default: false })
  online: Boolean;

  @OneToMany(type => Mail, t => t.customer)
  forms: Mail[];

  @OneToMany(type => MessagesReadCustomer, c => c.customer)
  readBy?: MessagesReadCustomer[];

  @OneToMany(type => ChatRoom, c => c.customer)
  chats: ChatRoom[];

  @Column({ default: null, select: false })
  password_code: number;
}

