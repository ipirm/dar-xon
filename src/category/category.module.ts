import { Module } from "@nestjs/common";
import { CategoryService } from "./category.service";
import { CategoryController } from "./category.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Category } from "../database/entities/category.entity";
import { TaskTypes } from "../database/entities/task-types.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([Category,TaskTypes])
  ],
  providers: [CategoryService],
  controllers: [CategoryController]
})
export class CategoryModule {
}
