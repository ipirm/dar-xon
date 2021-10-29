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
import { RateLimiterModule } from "nestjs-rate-limiter";
import { GoogleRecaptchaModule } from "@nestlab/google-recaptcha";
import { IncomingMessage } from "http";


@Module({
  imports: [
    RateLimiterModule,
    ConfigModule.forRoot({
      envFilePath: ".env",
      isGlobal: true
    }),
    MailerModule.forRoot({
      transport: {
        host: "smtp.yandex.ru",
        port: 465,
        secure: true, // true for 465, false for other ports
        auth: {
          user: "hello@tviser.agency", // generated ethereal user
          pass: "ilham564" // generated ethereal password
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
    GoogleRecaptchaModule.forRoot({
      secretKey: process.env.GOOGLE_RECAPTCHA_SECRET_KEY,
      response: (req: IncomingMessage) => (req.headers.recaptcha || "").toString(),
      skipIf: process.env.NODE_ENV !== "production",
      actions: ["SignIn"],
      score: 0.8
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
