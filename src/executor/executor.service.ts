import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DeleteResult, Repository, UpdateResult } from "typeorm";
import { paginate, Pagination } from "nestjs-typeorm-paginate";
import { Executor } from "../database/entities/executor.entity";
import { CreateExecutorDto } from "./dto/create-executor.dto";
import { AwsService } from "../aws/aws.service";
import * as bcrypt from "bcrypt";
import { ConfirmDto } from "../auth/dto/confirm.dto";
import { RegistrationExecutorDto } from "../auth/dto/registration-executor.dto";

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
    if (files) {
      for (const [key, value] of Object.entries(files)) {
        const file = await this.aws.uploadPublicFile(value[0]);
        Object.assign(createExecutorDto, { [key]: { url: file.url, name: file.key } });
      }
    }
    return await this.executor.save(this.executor.create(createExecutorDto));
  }

  async getOne(id: number): Promise<Executor> {
    let full: object = {};
    const user = await this.executor.findOne(id);
    for (const [key, value] of Object.entries(user)) {
      if (value !== null) {
        console.log(value);
        Object.assign(full, { [key]: value });
      }
    }
    Object.assign(user, { fullness: Math.ceil(Object.entries(full).length / Object.entries(user).length * 100) });
    return user;
  }

  async updateExecutor(id: number, createExecutorDto: CreateExecutorDto, files: Express.Multer.File[]): Promise<UpdateResult> {
    if (files) {
      for (const [key, value] of Object.entries(files)) {
        const file = await this.aws.uploadPublicFile(value[0]);
        Object.assign(createExecutorDto, { [key]: { name: file.key, url: file.url } });
      }
    }
    return await this.executor.update(id, this.executor.create(createExecutorDto));
  }

  async deleteExecutor(id: number): Promise<DeleteResult> {
    return await this.executor.delete(id);
  }

  async findOne(nickname: string, password: string): Promise<Executor> {
    const user = await this.executor.createQueryBuilder("executor")
      .addSelect(["executor.password", "executor.confirmed", "executor.banned"])
      .where("executor.phone = :nickname OR executor.login = :nickname", { nickname })
      .getOne();

    if (!user)
      throw new HttpException({
        status: HttpStatus.FORBIDDEN,
        error: "Учетная запись c таким логином не найдена"
      }, HttpStatus.FORBIDDEN);

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      throw new HttpException({
        status: HttpStatus.FORBIDDEN,
        error: "Неверный пароль"
      }, HttpStatus.FORBIDDEN);
    }

    if (user.banned) {
      throw new HttpException({
        status: HttpStatus.FORBIDDEN,
        error: "Пользователь заблокирован"
      }, HttpStatus.FORBIDDEN);
    }


    return user;
  }

  async registrationExecutor(registrationExecutorDto: RegistrationExecutorDto): Promise<Executor> {
    let data = await this.executor.createQueryBuilder("executor")
      .addSelect(["executor.confirmed"])
      .where("executor.phone = :phone OR executor.login = :login", {
        phone: registrationExecutorDto.phone,
        login: registrationExecutorDto.login
      }).getOne();

    if (data)
      throw new HttpException({
        status: HttpStatus.CONFLICT,
        error: "Данный пользователь уже зарегестрирован"
      }, HttpStatus.CONFLICT);

    return await this.executor.save(this.executor.create(registrationExecutorDto));
  }

  async confirmNumber(confirmDto: ConfirmDto): Promise<Executor> {
    const user = await this.executor.createQueryBuilder("e").addSelect(["e.confirmation_phone"]).getOne();

    if (user.confirmation_phone !== confirmDto.value)
      throw new HttpException({
        status: HttpStatus.CONFLICT,
        error: "Неверный код"
      }, HttpStatus.CONFLICT);

    await this.executor.update(confirmDto.user_id, { confirmed_phone: true });
    return await this.executor.findOne(confirmDto.user_id);
  }

  async getTasksStatus(user): Promise<Executor> {
    const data = await this.executor.createQueryBuilder("c")
      .select(["c.id"])
      .where("c.id = :id", { id: user.id })
      .loadRelationCountAndMap("task.createdCount", "c.tasks", "createdCount", qb => qb.andWhere("createdCount.status = :status", { status: "created" }))
      .loadRelationCountAndMap("task.activeCount", "c.tasks", "activeCount", qb => qb.andWhere("activeCount.status = :status", { status: "started" }))
      .loadRelationCountAndMap("task.finishedCount", "c.tasks", "finishedCount", qb => qb.andWhere("finishedCount.status = :status", { status: "finished" }))
      .loadRelationCountAndMap("task.reviewCount", "c.reviews", "reviewCount")
      .getOne();
    return data;
  }

  async setOnline(user, status): Promise<UpdateResult> {
    return await this.executor.update(user.id, { online: status });
  }
}
