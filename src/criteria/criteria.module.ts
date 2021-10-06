import { Module } from "@nestjs/common";
import { CriteriaService } from "./criteria.service";
import { CriteriaController } from "./criteria.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Criteria } from "../database/entities/criteria.entity";
import { CriteriaItem } from "../database/entities/criteria-item.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([Criteria, CriteriaItem])
  ],
  providers: [CriteriaService],
  controllers: [CriteriaController]
})
export class CriteriaModule {
}
