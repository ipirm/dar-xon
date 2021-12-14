import { BeforeInsert, BeforeUpdate, Column, Entity } from "typeorm";
import { BaseEntity } from "./base.entity";
import * as bcrypt from "bcrypt";


@Entity("admin")
export class Admin extends BaseEntity {

  @Column({ nullable: true })
  fio: string;

  @Column({ nullable: true })
  avatar: string;

  @Column({ nullable: true })
  email: string;

  @Column({ select: false, nullable: true })
  password: string;

  @BeforeInsert()
  async generatePasswordHashInsert(): Promise<void> {
    this.password = await bcrypt.hashSync(this.password, bcrypt.genSaltSync(this.salt));
  }

  @BeforeUpdate()
  async generatePasswordHash(): Promise<void> {
    if (this.password !== this.password)
    this.password = await bcrypt.hashSync(this.password, bcrypt.genSaltSync(this.salt));
  }

  @Column({ type: "integer", default: 10, select: false })
  salt: number;

  @Column({
    nullable: true,
    select: false
  })
  public currentHashedRefreshToken?: string;
}
