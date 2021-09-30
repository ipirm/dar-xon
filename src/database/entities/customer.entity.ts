import { BeforeUpdate, Column, Entity } from "typeorm";
import { BaseEntity } from "./base.entity";
import { CustomerTypeEnum } from "../../enums/customerType.enum";
import * as bcrypt from "bcrypt";

@Entity("customer")
export class Customer extends BaseEntity {

  @Column({ nullable: true })
  fio: string;

  @Column({ nullable: true })
  email: string;

  @Column({ type: "varchar", nullable: true })
  phone: string;

  @Column({ select: false, nullable: true })
  password: string;

  @BeforeUpdate()
  async generatePasswordHash(): Promise<void> {
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
  files: { url: string }[];

  @Column("enum", { enum: CustomerTypeEnum, default: CustomerTypeEnum.SelfEmployed })
  customer_type: CustomerTypeEnum;

  @Column({ default: "123456", select: false })
  confirmation: string;

  @Column({ default: false, select: false })
  confirmed: Boolean;
}