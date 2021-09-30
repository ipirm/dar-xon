import { Module } from "@nestjs/common";
import { CustomerService } from "./customer.service";
import { CustomerController } from "./customer.controller";
import { Customer } from "../database/entities/customer.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AwsModule } from "../aws/aws.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Customer]),
    AwsModule
  ],
  providers: [CustomerService],
  controllers: [CustomerController]
})
export class CustomerModule {
}
