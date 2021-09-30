import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DeleteResult, Repository, UpdateResult } from "typeorm";
import { paginate, Pagination } from "nestjs-typeorm-paginate";
import { Customer } from "../database/entities/customer.entity";
import { CreateCustomerDto } from "./dto/create-customer.dto";
import * as bcrypt from "bcrypt";
import { AwsService } from "../aws/aws.service";
import { RegistrationDto } from "../auth/dto/registration.dto";
import { ConfirmDto } from "../auth/dto/confirm.dto";

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
        const file = await this.aws.uploadPublicFile(value[0]);
        Object.assign(createCustomerDto, { [key]: file.url });
      }
    }
    return await this.customer.save(this.customer.create(createCustomerDto));
  }

  async getOne(id: number): Promise<Customer> {
    return await this.customer.findOne(id);
  }

  async updateCustomer(id: number, createCustomerDto: CreateCustomerDto, files: Express.Multer.File[]): Promise<UpdateResult> {
    if (files) {
      for (const [key, value] of Object.entries(files)) {
        const file = await this.aws.uploadPublicFile(value[0]);
        Object.assign(createCustomerDto, { [key]: file.url });
      }
    }
    return await this.customer.update(id, { ...createCustomerDto });
  }

  async deleteCustomer(id: number): Promise<DeleteResult> {
    return await this.customer.delete(id);
  }

  async findOne(nickname: string, password: string): Promise<Customer> {
    const user = await this.customer.createQueryBuilder("customer")
      .addSelect(["customer.password", "customer.confirmed"])
      .where("customer.email = :nickname OR customer.phone = :nickname", { nickname })
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

    if (!user.confirmed) {
      throw new HttpException({
        status: HttpStatus.CONFLICT,
        error: "Логин не потверджен"
      }, HttpStatus.CONFLICT);
    }


    return user;
  }

  async registrationCustomer(registrationDto: RegistrationDto): Promise<Customer> {
    let data = await this.customer.createQueryBuilder("customer")
      .addSelect(["customer.confirmed"])
      .where("customer.email = :email OR customer.phone = :phone", {
        email: registrationDto.email,
        phone: registrationDto.phone
      }).getOne();

    if (data)
      return data;

    return await this.customer.save(this.customer.create(registrationDto));
  }

  async confirmNumber(confirmDto: ConfirmDto): Promise<Customer> {
    const user = await this.customer.createQueryBuilder("e").addSelect(["e.confirmation"]).getOne();

    if (user.confirmation !== confirmDto.value)
      throw new HttpException({
        status: HttpStatus.CONFLICT,
        error: "Неверный код"
      }, HttpStatus.CONFLICT);

    await this.customer.update(confirmDto.user_id, { confirmed: true });
    return await this.customer.findOne(confirmDto.user_id);
  }
}
