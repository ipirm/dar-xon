import { Module } from "@nestjs/common";
import { TaskService } from "./task.service";
import { TaskController } from "./task.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Task } from "../database/entities/task.entity";
import { AwsModule } from "../aws/aws.module";
import { TaskResponses } from "../database/entities/taskResponses.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([Task, TaskResponses]),
    AwsModule
  ],
  providers: [TaskService],
  controllers: [TaskController]
})
export class TaskModule {
}
