import { Module } from "@nestjs/common";
import { CustomerService } from "./customer.service";
import { CustomerController } from "./customer.controller";
import { Customer } from "../database/entities/customer.entity";
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
  imports: [
    TypeOrmModule.forFeature([Customer])
  ],
  providers: [CustomerService],
  controllers: [CustomerController]
})
export class CustomerModule {
}
