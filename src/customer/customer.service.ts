import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DeleteResult, Repository, UpdateResult } from "typeorm";
import { paginate, Pagination } from "nestjs-typeorm-paginate";
import { Customer } from "../database/entities/customer.entity";
import { CreateCustomerDto } from "./dto/create-customer.dto";
import { AwsService } from "../aws/aws.service";
import { ConfirmDto } from "../auth/dto/confirm.dto";
import { RegistrationCustomerDto } from "../auth/dto/registration-customer.dto";
import * as bcrypt from "bcrypt";
import { ConfirmEmailDto } from "../auth/dto/confirm-email.dto";

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(Customer) private readonly customer: Repository<Customer>,
    private readonly aws: AwsService
  ) {
  }

  async getAll(page, limit): Promise<Pagination<Customer>> {
    const data = await this.customer.createQueryBuilder("customer");
    return await paginate(data, { page, limit });
  }

  async saveCustomer(createCustomerDto: CreateCustomerDto, files: Express.Multer.File[] = undefined): Promise<Customer> {
    if (files) {
      for (const [key, value] of Object.entries(files)) {
        if (key === "avatar") {
          const file = await this.aws.uploadPublicFile(value[0]);
          console.log(file);
          Object.assign(createCustomerDto, { [key]: { name: file.key, url: file.url } });
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
          Object.assign(createCustomerDto, { [key]: uploadedFiles });
        }
      }
    }
    return await this.customer.save(this.customer.create(createCustomerDto));
  }

  async getOne(id: number): Promise<Customer> {
    let full: object = {};
    const user = await this.customer.findOne(id);
    for (const [key, value] of Object.entries(user)) {
      if (value !== null) {
        Object.assign(full, { [key]: value });
      }
    }
    Object.assign(user, { fullness: Math.ceil(Object.entries(full).length / Object.entries(user).length * 100) });
    return user;
  }

  async updateCustomer(id: number, createCustomerDto: CreateCustomerDto, files: Express.Multer.File[]): Promise<UpdateResult> {
    if (files) {
      for (const [key, value] of Object.entries(files)) {
        if (key === "avatar") {
          const file = await this.aws.uploadPublicFile(value[0]);
          console.log(file);
          Object.assign(createCustomerDto, { avatar: { name: file.key, url: file.url } });
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
          Object.assign(createCustomerDto, { files: uploadedFiles });
        }
      }
    }
    return await this.customer.update(id, this.customer.create(createCustomerDto));
  }

  async deleteCustomer(id: number): Promise<DeleteResult> {
    return await this.customer.delete(id);
  }

  async findOne(nickname: string, password: string): Promise<Customer> {
    const user = await this.customer.createQueryBuilder("customer")
      .addSelect(["customer.password", "customer.banned"])
      .where("customer.email = :nickname OR customer.phone = :nickname OR customer.login = :nickname", { nickname })
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

  async registrationCustomer(registrationCustomerDto: RegistrationCustomerDto): Promise<Customer> {
    let data = await this.customer.createQueryBuilder("customer")
      .where("customer.email = :email OR customer.phone = :phone OR customer.login = :login", {
        email: registrationCustomerDto.email,
        phone: registrationCustomerDto.phone,
        login: registrationCustomerDto.login
      }).getOne();


    if (data)
      throw new HttpException({
        status: HttpStatus.CONFLICT,
        error: "Данный пользователь уже зарегестрирован"
      }, HttpStatus.CONFLICT);

    return await this.customer.save(this.customer.create(registrationCustomerDto));
  }

  async confirmNumber(confirmDto: ConfirmDto): Promise<Customer> {
    const user = await this.customer.createQueryBuilder("c")
      .where("c.id = :id", { id: confirmDto.user_id })
      .addSelect(["c.confirmation_phone"])
      .getOne();

    if (user.confirmation_phone !== confirmDto.value)
      throw new HttpException({
        status: HttpStatus.CONFLICT,
        error: "Неверный код"
      }, HttpStatus.CONFLICT);

    await this.customer.update(confirmDto.user_id, { confirmed_phone: true });
    return await this.customer.findOne(confirmDto.user_id);
  }

  async confirmEmail(confirmEmailDto: ConfirmEmailDto): Promise<Customer> {
    const user = await this.customer.createQueryBuilder("c")
      .where("c.id = :id", { id: confirmEmailDto.user_id })
      .addSelect(["c.confirmation_email"])
      .getOne();


    if (user.confirmation_email !== confirmEmailDto.value)
      throw new HttpException({
        status: HttpStatus.CONFLICT,
        error: "Неверный код"
      }, HttpStatus.CONFLICT);

    await this.customer.update(user.id, { confirmed_email: true });
    return await this.customer.findOne(confirmEmailDto.user_id);
  }

  async getTasksStatus(user): Promise<Customer> {
    const data = await this.customer.createQueryBuilder("c")
      .select(["c.id"])
      .where("c.id = :id", { id: user.id })
      .loadRelationCountAndMap("task.createdCount", "c.tasks", "createdCount", qb => qb.andWhere("createdCount.status = :status", { status: "created" }))
      .loadRelationCountAndMap("task.activeCount", "c.tasks", "activeCount", qb => qb.andWhere("activeCount.status = :status", { status: "started" }))
      .loadRelationCountAndMap("task.finishedCount", "c.tasks", "finishedCount", qb => qb.andWhere("finishedCount.status = :status", { status: "finished" }))
      .getOne();
    return data;
  }

  async updateConfirmNumber(user, authCode: string): Promise<UpdateResult> {
    return await this.customer.update(user, { confirmation_phone: authCode });
  }

  async updateConfirmEmail(user, authCode: string): Promise<UpdateResult> {
    return await this.customer.update(user, { confirmation_email: authCode });
  }

}
