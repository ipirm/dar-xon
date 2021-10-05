import { Column, Entity } from "typeorm";
import { BaseEntity } from "./base.entity";


@Entity("mail")
export class Mail extends BaseEntity {
  
  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true, type: "varchar" })
  theme: string;

  @Column({ nullable: true, type: "varchar", length: 1500 })
  text: string;

}