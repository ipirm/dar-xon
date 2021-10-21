import { Column, Entity, Tree, TreeChildren, TreeParent } from "typeorm";
import { BaseEntity } from "./base.entity";


@Entity("categories-parser")
@Tree("closure-table")
export class CatsParserEntity extends BaseEntity {

  @Column({ nullable: true })
  name: string;

  @TreeChildren()
  children: CatsParserEntity[];

  @TreeParent({ onDelete: "CASCADE" })
  parent: CatsParserEntity;

}