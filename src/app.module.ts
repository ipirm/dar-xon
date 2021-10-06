import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from './auth/auth.module';
import { ExecutorModule } from './executor/executor.module';
import { AwsModule } from './aws/aws.module';
import { CustomerModule } from './customer/customer.module';
import { CategoryModule } from './category/category.module';
import { TaskModule } from './task/task.module';
import { PortfolioModule } from './portfolio/portfolio.module';
import { AdminModule } from './admin/admin.module';
import { CriteriaModule } from './criteria/criteria.module';
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
    CustomerModule,
    CategoryModule,
    TaskModule,
    PortfolioModule,
    AdminModule,
    CriteriaModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {
}
