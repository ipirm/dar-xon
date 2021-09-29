import { Module } from "@nestjs/common";
import { ExecutorService } from "./executor.service";
import { ExecutorController } from "./executor.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Executor } from "../database/entities/executor.entity";
import { AwsModule } from "../aws/aws.module";
import { AwsService } from "../aws/aws.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([Executor]),
    AwsModule
  ],
  providers: [ExecutorService,AwsService],
  controllers: [ExecutorController]
})
export class ExecutorModule {
}
