import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Portfolio } from "../database/entities/portfolio.entity";
import { DeleteResult, Repository, UpdateResult } from "typeorm";
import { CreatePortfolioDto } from "./dto/create-portfolio.dto";
import { AwsService } from "../aws/aws.service";
import { paginate, Pagination } from "nestjs-typeorm-paginate";

@Injectable()
export class PortfolioService {
  constructor(
    @InjectRepository(Portfolio) private readonly portfolio: Repository<Portfolio>,
    private readonly aws: AwsService
  ) {
  }

  async savePortfolio(createPortfolioDto: CreatePortfolioDto, files: any, user): Promise<Portfolio> {
    const images: any = [];
    if (files.length) {
      if (files?.image) {
        const image = await this.aws.uploadPublicFile(files?.image[0]);
        Object.assign(createPortfolioDto, { image: image.url });
      }
      for (const [key, value] of Object.entries(files?.files)) {
        const file = await this.aws.uploadPublicFile(value);
        images.push({
          url: file.url
        });
      }
      Object.assign(createPortfolioDto, { files: images });
    }

    Object.assign(createPortfolioDto, {
      executor: user.id
    });

    return await this.portfolio.save(this.portfolio.create(createPortfolioDto));
  }

  async getAll(page, limit): Promise<Pagination<Portfolio>> {
    const data = this.portfolio.createQueryBuilder("portfolio")
      .leftJoinAndSelect("portfolio.executor", "executor")
      .leftJoinAndSelect("portfolio.category", "category")
      .leftJoinAndSelect("category.parent", "parent");
    return await paginate(data, { page, limit });
  }

  async findOne(id: number): Promise<Portfolio> {
    return await this.portfolio.createQueryBuilder("portfolio")
      .where("portfolio.id = :id", { id: id })
      .leftJoinAndSelect("portfolio.executor", "executor")
      .leftJoinAndSelect("portfolio.category", "category")
      .leftJoinAndSelect("category.parent", "parent")
      .getOne();
  }

  async updatePortfolio(id, createPortfolioDto, files, user): Promise<UpdateResult> {
    const portfolio = await this.portfolio.findOne(id, { relations: ["executor"] });

    if (!id)
      throw new HttpException({ status: HttpStatus.NOT_FOUND, error: "Портфолио не найдено" }, HttpStatus.NOT_FOUND);

    if (portfolio.executor.id !== user.id) throw new HttpException({
      status: HttpStatus.UNAUTHORIZED,
      error: "Вы не Явлеетесь создателем данного портфолио"
    }, HttpStatus.UNAUTHORIZED);

    const images: any = [];

    if (files.length) {
      if (files?.image) {
        const image = await this.aws.uploadPublicFile(files?.image[0]);
        Object.assign(createPortfolioDto, { image: image.url });
      }
      for (const [key, value] of Object.entries(files?.files)) {
        const file = await this.aws.uploadPublicFile(value);
        images.push({
          url: file.url
        });
      }
      Object.assign(createPortfolioDto, { files: images });
    }

    // @ts-ignore
    return await this.portfolio.update(id, this.portfolio.create(createPortfolioDto));
  }

  async deletePortfolio(id: number): Promise<DeleteResult> {
    return await this.portfolio.delete(id);
  }
}