import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DeleteResult, Repository } from "typeorm";
import { paginate, Pagination } from "nestjs-typeorm-paginate";
import { Executor } from "../database/entities/executor.entity";
import { CreateExecutorDto } from "./dto/create-executor.dto";
import { AwsService } from "../aws/aws.service";
import * as bcrypt from "bcrypt";
import { RegistrationDto } from "../auth/dto/registration.dto";
import { ConfirmDto } from "../auth/dto/confirm.dto";

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
        Object.assign(createExecutorDto, { [key]: file.url });
      }
    }
    return await this.executor.save(this.executor.create(createExecutorDto));
  }

  async getOne(id: number): Promise<Executor> {
    return await this.executor.findOne(id);
  }

  async updateExecutor(id: number, createExecutorDto: CreateExecutorDto, files: Express.Multer.File[]): Promise<any> {
    if (files) {
      for (const [key, value] of Object.entries(files)) {
        const file = await this.aws.uploadPublicFile(value[0]);
        Object.assign(createExecutorDto, { [key]: file.url });
      }
    }
    await this.executor.update(id, this.executor.create(createExecutorDto));
    return await this.executor.findOne(id);
  }

  async deleteExecutor(id: number): Promise<DeleteResult> {
    return await this.executor.delete(id);
  }

  async findOne(nickname: string, password: string): Promise<Executor> {
    const user = await this.executor.createQueryBuilder("executor")
      .addSelect(["executor.password", "executor.confirmed"])
      .where("executor.email = :nickname OR executor.phone = :nickname", { nickname })
      .getOne();

    console.log(user)

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

    if (!user.confirmed) {
      throw new HttpException({
        status: HttpStatus.CONFLICT,
        error: "Логин не потверджен"
      }, HttpStatus.CONFLICT);
    }

    return user;
  }

  async registrationExecutor(registrationDto: RegistrationDto): Promise<Executor> {
    let data = await this.executor.createQueryBuilder("executor")
      .addSelect(["executor.confirmed"])
      .where("executor.email = :email OR executor.phone = :phone", {
        email: registrationDto.email,
        phone: registrationDto.phone
      }).getOne();

    if (data)
      return data;

    return await this.executor.save(this.executor.create(registrationDto));
  }

  async confirmNumber(confirmDto: ConfirmDto): Promise<Executor> {
    const user = await this.executor.createQueryBuilder("e").addSelect(["e.confirmation"]).getOne();

    if (user.confirmation !== confirmDto.value)
      throw new HttpException({
        status: HttpStatus.CONFLICT,
        error: "Неверный код"
      }, HttpStatus.CONFLICT);

    await this.executor.update(confirmDto.user_id, { confirmed: true });
    return await this.executor.findOne(confirmDto.user_id);
  }
}
