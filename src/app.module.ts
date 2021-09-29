import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from './auth/auth.module';
import { ExecutorModule } from './executor/executor.module';
import { AwsModule } from './aws/aws.module';
import { CustomerModule } from './customer/customer.module';
import * as ormConfig from "./database/orm.config";


@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ".env",
      isGlobal: true
    }),
    TypeOrmModule.forRoot(ormConfig),
    AuthModule,
    ExecutorModule,
    AwsModule,
    CustomerModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {
}
