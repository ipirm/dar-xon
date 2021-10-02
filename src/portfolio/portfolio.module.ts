import { Module } from "@nestjs/common";
import { PortfolioService } from "./portfolio.service";
import { PortfolioController } from "./portfolio.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AwsModule } from "../aws/aws.module";
import { Portfolio } from "../database/entities/portfolio.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([Portfolio]),
    AwsModule
  ],
  providers: [PortfolioService],
  controllers: [PortfolioController]
})
export class PortfolioModule {
}
