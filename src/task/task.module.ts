import { Module } from "@nestjs/common";
import { TaskService } from "./task.service";
import { TaskController } from "./task.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Task } from "../database/entities/task.entity";
import { AwsModule } from "../aws/aws.module";
import { TaskResponses } from "../database/entities/taskResponses.entity";
import { Executor } from "../database/entities/executor.entity";
import { CriteriaItem } from "../database/entities/criteria-item.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([Task, TaskResponses, Executor, CriteriaItem]),
    AwsModule
  ],
  providers: [TaskService],
  controllers: [TaskController]
})
export class TaskModule {
}
