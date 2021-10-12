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
    if (files) {
      for (const [key, value] of Object.entries(files)) {
        if (key === "image") {
          const file = await this.aws.uploadPublicFile(value[0]);
          Object.assign(createPortfolioDto, { image: { name: file.key, url: file.url } });
        } else if (key === "logo") {
          const file = await this.aws.uploadPublicFile(value[0]);
          Object.assign(createPortfolioDto, { logo: { name: file.key, url: file.url } });
        } else {
          const uploadedFiles = [];
          // @ts-ignore
          for (const item of value) {
            const file = await this.aws.uploadPublicFile(item);
            uploadedFiles.push({
              name: file.key,
              url: file.url
            });
          }
          Object.assign(createPortfolioDto, { files: uploadedFiles });
        }
      }
    }

    Object.assign(createPortfolioDto, {
      executor: user.id
    });

    return await this.portfolio.save(this.portfolio.create(createPortfolioDto));
  }

  async getAll(page, limit, user, cat): Promise<Pagination<Portfolio>> {
    const data = this.portfolio.createQueryBuilder("portfolio")
      .leftJoinAndSelect("portfolio.executor", "executor")
      .leftJoinAndSelect("portfolio.category", "category")
      .where("executor.id = :id", { id: user.id });
    
    if (cat)
      data.andWhere("category.id = :cat", { cat: cat });

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

    if (files) {
      for (const [key, value] of Object.entries(files)) {
        if (key === "image") {
          const file = await this.aws.uploadPublicFile(value[0]);
          Object.assign(createPortfolioDto, { image: { name: file.key, url: file.url } });
        } else if (key === "logo") {
          const file = await this.aws.uploadPublicFile(value[0]);
          Object.assign(createPortfolioDto, { logo: { name: file.key, url: file.url } });
        } else {
          const uploadedFiles = [];
          // @ts-ignore
          for (const item of value) {
            const file = await this.aws.uploadPublicFile(item);
            uploadedFiles.push({
              name: file.key,
              url: file.url
            });
          }
          Object.assign(createPortfolioDto, { files: uploadedFiles });
        }
      }
    }

    // @ts-ignore
    return await this.portfolio.update(id, this.portfolio.create(createPortfolioDto));
  }

  async deletePortfolio(id: number): Promise<DeleteResult> {
    return await this.portfolio.delete(id);
  }
}