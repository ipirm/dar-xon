import { Column, Entity } from "typeorm";
import { BaseEntity } from "./base.entity";
import { CustomerTypeEnum } from "../../enums/customerType.enum";


@Entity("customer")
export class Customer extends BaseEntity {

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  email: string;

  @Column({ type: "varchar", nullable: true })
  phone: string;

  @Column({ select: true })
  password: string;

  @Column({ nullable: true })
  company_name: string;

  @Column({ nullable: true })
  company_address: string;

  @Column({ nullable: true })
  inn: string;

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
}