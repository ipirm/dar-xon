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

@Module({
  imports: [
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: "286400s" }
    }),
    TypeOrmModule.forFeature([Customer, Executor]),
    AwsModule
  ],
  providers: [AuthService, JwtStrategy, CustomerService, ExecutorService, RolesGuard],
  controllers: [AuthController]
})
export class AuthModule {}
