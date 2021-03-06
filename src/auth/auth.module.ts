import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Customer } from "../database/entities/customer.entity";
import { Executor } from "../database/entities/executor.entity";
import { jwtConstants } from "./jwt/constants";
import { JwtStrategy } from "./jwt/jwt.strategy";
import { RolesGuard } from "./guards/roles.guard";
import { CustomerService } from "../customer/customer.service";
import { ExecutorService } from "../executor/executor.service";
import { AwsModule } from "../aws/aws.module";
import { Admin } from "../database/entities/admin.entity";
import { AdminService } from "../admin/admin.service";
import { Mail } from "../database/entities/mail.entity";
import { HttpModule } from "@nestjs/axios";
import { Task } from "../database/entities/task.entity";
import { ThrottleEmailGuard } from "./guards/throttle-email.guard";
import { ThrottlePhoneGuard } from "./guards/throttle-phone.guard";

@Module({
  imports: [
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: "286400s" }
    }),
    HttpModule,
    TypeOrmModule.forFeature([Customer, Executor, Admin, Mail, Task]),
    AwsModule
  ],
  providers: [AuthService, JwtStrategy, CustomerService, ExecutorService, RolesGuard, AdminService, ThrottleEmailGuard, ThrottlePhoneGuard],
  controllers: [AuthController]
})
export class AuthModule {}