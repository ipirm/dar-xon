import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DeleteResult, Repository, UpdateResult } from "typeorm";
import { paginate, Pagination } from "nestjs-typeorm-paginate";
import { Executor } from "../database/entities/executor.entity";
import { CreateExecutorDto } from "./dto/create-executor.dto";
import { AwsService } from "../aws/aws.service";

@Injectable()
export class ExecutorService {
  constructor(
    @InjectRepository(Executor) private readonly executor: Repository<Executor>,
    private readonly aws: AwsService
  ) {
  }

  async getAll(page, limit): Promise<Pagination<Executor>> {
    const data = await this.executor.createQueryBuilder("executor");
    return await paginate(data, { page, limit });
  }

  async saveExecutor(createExecutorDto: CreateExecutorDto, files: Express.Multer.File[]): Promise<Executor> {
    for (const [key, value] of Object.entries(files)) {
      const file = await this.aws.uploadPublicFile(value[0]);
      Object.assign(createExecutorDto, { [key]: file.url });
    }
    return await this.executor.save(this.executor.create(createExecutorDto));
  }

  async getOne(id: number): Promise<Executor> {
    return await this.executor.findOne(id);
  }

  async updateExecutor(id: number, createExecutorDto: CreateExecutorDto, files: Express.Multer.File[]): Promise<UpdateResult> {
    for (const [key, value] of Object.entries(files)) {
      const file = await this.aws.uploadPublicFile(value[0]);
      Object.assign(createExecutorDto, { [key]: file.url });
    }
    return await this.executor.update(id, {...createExecutorDto});
  }

  async deleteExecutor(id: number): Promise<DeleteResult> {
    return await this.executor.delete(id);
  }
}
