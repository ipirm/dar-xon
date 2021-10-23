import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule } from "@nestjs/config";
import { AuthModule } from "./auth/auth.module";
import { ExecutorModule } from "./executor/executor.module";
import { AwsModule } from "./aws/aws.module";
import { CustomerModule } from "./customer/customer.module";
import { CategoryModule } from "./category/category.module";
import { TaskModule } from "./task/task.module";
import { PortfolioModule } from "./portfolio/portfolio.module";
import { AdminModule } from "./admin/admin.module";
import { CriteriaModule } from "./criteria/criteria.module";
import { ChatModule } from "./chat/chat.module";
import * as ormConfig from "./database/orm.config";
import { ServeStaticModule } from "@nestjs/serve-static";
import { ReviewModule } from "./review/review.module";
import { MailerModule } from "@nestjs-modules/mailer";
import { HandlebarsAdapter } from "@nestjs-modules/mailer/dist/adapters/handlebars.adapter";


@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ".env",
      isGlobal: true
    }),
    MailerModule.forRoot({
      transport: {
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
          user: "birji62598@gmail.com", // generated ethereal user
          pass: "2587889e" // generated ethereal password
        }
      },
      template: {
        dir: `${process.cwd()}/templates/`,
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true
        }
      }
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
    CriteriaModule,
    ChatModule,
    ServeStaticModule.forRoot({ rootPath: `${process.cwd()}/public` }),
    ReviewModule,
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {
}
