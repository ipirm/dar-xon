import { Module } from "@nestjs/common";
import { AdminController } from "./admin.controller";
import { AdminService } from "./admin.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Admin } from "../database/entities/admin.entity";
import { AwsModule } from "../aws/aws.module";
import { Executor } from "../database/entities/executor.entity";
import { Customer } from "../database/entities/customer.entity";
import { Mail } from "../database/entities/mail.entity";
import { Task } from "../database/entities/task.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([Admin, Executor, Customer, Mail, Task]),
    AwsModule
  ],
  controllers: [AdminController],
  providers: [AdminService]
})
export class AdminModule {
}
