import { BeforeInsert, Column, Entity } from "typeorm";
import { BaseEntity } from "./base.entity";
import * as bcrypt from "bcrypt";


@Entity("executor")
export class Executor extends BaseEntity {

  @Column()
  fio: string;

  @Column({ type: "varchar",nullable: true })
  phone: string;

  @Column({ select: true })
  password: string;

  @BeforeInsert()
  async generatePasswordHash(): Promise<void> {
    this.password = await bcrypt.hashSync(this.password, bcrypt.genSaltSync(this.salt));
  }

  @Column({ type: "integer", default: 10, select: false })
  salt: number;

  @Column()
  p_series: string;

  @Column()
  p_number: number;

  @Column()
  p_by: string;

  @Column()
  p_issue_time: string;

  @Column()
  p_birth_date: string;

  @Column({nullable: true})
  p_scan: string;

  @Column({nullable: true})
  p_pink: string;
}