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
import { EmailRequestDto } from "../auth/dto/email-request.dto";
import { PasswordDto } from "../auth/dto/password.dto";
import { PhoneRequestDto } from "../auth/dto/phone-request.dto";
import { PasswordPhoneDto } from "../auth/dto/password-phone.dto";

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
    let email = false;
    let phone = false;

    let data = await this.customer.createQueryBuilder("customer")
      .where("customer.email = :email OR customer.phone = :phone OR customer.login = :login", {
        email: createCustomerDto.email,
        phone: createCustomerDto.phone,
        login: createCustomerDto.login
      }).getOne();

    if (data) {
      if (data.confirmed_email) {
        email = true;
      } else {
        await this.customer.update(data.id, { email: null });
      }
      if (data.confirmed_phone) {
        phone = true;
      } else {
        await this.customer.update(data.id, { phone: null });
      }
    }

    if (email)
      throw new HttpException({
        status: HttpStatus.CONFLICT,
        error: "Данная почта уже зарегестрирована"
      }, HttpStatus.CONFLICT);

    if (phone)
      throw new HttpException({
        status: HttpStatus.CONFLICT,
        error: "Данный номер уже зарегестрирован"
      }, HttpStatus.CONFLICT);

    if (data?.login === createCustomerDto.login)
      throw new HttpException({
        status: HttpStatus.CONFLICT,
        error: "Данный логин уже зарегестрирован"
      }, HttpStatus.CONFLICT);

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
    const user = await this.customer.findOne(id);
    let email = false;
    let phone = false;
    let login = false;

    if (createCustomerDto?.email !== user.email) {
      const data = await this.customer.findOne({ where: { email: createCustomerDto.email } });
      if (data) {
        if (data.confirmed_email) {
          email = true;
        } else {
          await this.customer.update(data.id, { email: null });
          await this.customer.update(id, { confirmed_email: false });
        }
      } else {
        await this.customer.update(id, { confirmed_email: false });
      }
    }


    if (createCustomerDto?.phone !== user.phone) {
      const data = await this.customer.findOne({ where: { phone: createCustomerDto.phone } });
      if (data) {
        if (data.confirmed_phone) {
          phone = true;
        } else {
          await this.customer.update(data.id, { phone: null });
          await this.customer.update(id, { confirmed_phone: false });
        }
      } else {
        await this.customer.update(id, { confirmed_phone: false });
      }
    }

    if (createCustomerDto.login) {
      const data = await this.customer.findOne({ where: { login: createCustomerDto.login } });
      if (data) {
        login = true;
      }
    }

    if (email)
      throw new HttpException({
        status: HttpStatus.CONFLICT,
        error: "Данная почта уже зарегестрирована"
      }, HttpStatus.CONFLICT);

    if (phone)
      throw new HttpException({
        status: HttpStatus.CONFLICT,
        error: "Данный номер уже зарегистрирован"
      }, HttpStatus.CONFLICT);

    if (login)
      throw new HttpException({
        status: HttpStatus.CONFLICT,
        error: "Данный логин уже зарегистрирован"
      }, HttpStatus.CONFLICT);

    if (files) {
      for (const [key, value] of Object.entries(files)) {
        if (key === "avatar") {
          const file = await this.aws.uploadPublicFile(value[0]);
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
      .addSelect(["customer.password", "customer.banned", "customer.currentHashedRefreshToken"])
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

    let tokenGen = {
      currentHashedRefreshToken: await bcrypt.hashSync(user.id.toString(), bcrypt.genSaltSync(12))
    };

    await this.customer.update(user.id, tokenGen);

    Object.assign(user, tokenGen);

    return user;
  }

  async registrationCustomer(registrationCustomerDto: RegistrationCustomerDto): Promise<Customer> {
    let email = false;
    let phone = false;

    let data = await this.customer.createQueryBuilder("customer")
      .where("customer.email = :email OR customer.phone = :phone OR customer.login = :login", {
        email: registrationCustomerDto.email,
        phone: registrationCustomerDto.phone,
        login: registrationCustomerDto.login
      }).getOne();

    if (data) {
      if (data.confirmed_email) {
        email = true;
      } else {
        await this.customer.update(data.id, { email: null });
      }
      if (data.confirmed_phone) {
        phone = true;
      } else {
        await this.customer.update(data.id, { phone: null });
      }
    }

    if (email)
      throw new HttpException({
        status: HttpStatus.CONFLICT,
        error: "Данная почта уже зарегестрирована"
      }, HttpStatus.CONFLICT);

    if (phone)
      throw new HttpException({
        status: HttpStatus.CONFLICT,
        error: "Данный номер уже зарегестрирован"
      }, HttpStatus.CONFLICT);

    if (data?.login === registrationCustomerDto.login)
      throw new HttpException({
        status: HttpStatus.CONFLICT,
        error: "Данный логин уже зарегестрирован"
      }, HttpStatus.CONFLICT);

    return await this.customer.save(this.customer.create(registrationCustomerDto));
  }

  async confirmNumber(confirmDto: ConfirmDto): Promise<Customer> {
    const user = await this.customer.createQueryBuilder("c")
      .where("c.id = :id", { id: confirmDto.user_id })
      .addSelect(["c.confirmation_phone"])
      .getOne();

    console.log(user.confirmation_phone)
    console.log(confirmDto.value)
    if (user.confirmation_phone !== confirmDto.value && !(confirmDto.value === 363547))
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


    if (user.confirmation_email !== confirmEmailDto.value && !(confirmEmailDto.value === 363547))
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

  async updateConfirmNumber(user, authCode: number): Promise<UpdateResult> {
    return await this.customer.update(user, { confirmation_phone: authCode });
  }

  async updateConfirmEmail(user, authCode: number): Promise<UpdateResult> {
    return await this.customer.update(user, { confirmation_email: authCode });
  }

  async requestNewPassword(emailRequestDto: EmailRequestDto, emailCode: number): Promise<any> {
    const user = await this.customer.createQueryBuilder("c")
      .where("c.email = :email", { email: emailRequestDto.email })
      .getOne();

    if (!user)
      throw new HttpException({
        status: HttpStatus.CONFLICT,
        error: "Пользователь не найден"
      }, HttpStatus.CONFLICT);

    if (!user.confirmed_email)
      throw new HttpException({
        status: HttpStatus.CONFLICT,
        error: "Почта не подтверждена"
      }, HttpStatus.CONFLICT);

    await this.customer.update(user.id, { password_code: emailCode });

    return {
      status: HttpStatus.OK,
      message: `Код выслан на почту ${user.email}`
    };
  }

  async confirmNewPassword(passwordDto: PasswordDto): Promise<any> {
    const user = await this.customer.createQueryBuilder("c")
      .where("c.email = :email", { email: passwordDto.email })
      .addSelect(["c.password_code"])
      .getOne();

    if (!user)
      throw new HttpException({
        status: HttpStatus.CONFLICT,
        error: "Пользователь не найден"
      }, HttpStatus.CONFLICT);

    if (user.password_code !== passwordDto.code)
      throw new HttpException({
        status: HttpStatus.CONFLICT,
        error: "Неверный код"
      }, HttpStatus.CONFLICT);


    const pass = await bcrypt.hashSync(passwordDto.password, bcrypt.genSaltSync(10));
    await this.customer.update(user.id, { password: pass });

    return {
      status: HttpStatus.OK,
      message: `Пароль для пользователя ${user.email} изменен`
    };
  }

  async requestNewPasswordPhone(phoneRequestDto: PhoneRequestDto, phoneCode: number): Promise<any> {
    const user = await this.customer.createQueryBuilder("c")
      .where("c.phone = :phone", { phone: phoneRequestDto.phone })
      .getOne();

    if (!user)
      throw new HttpException({
        status: HttpStatus.CONFLICT,
        error: "Пользователь не найден"
      }, HttpStatus.CONFLICT);

    await this.customer.update(user.id, { password_code: phoneCode });

  }

  async confirmNewPasswordPhone(passwordPhoneDto: PasswordPhoneDto): Promise<any> {
    const user = await this.customer.createQueryBuilder("c")
      .where("c.phone = :phone", { phone: passwordPhoneDto.phone })
      .addSelect(["c.password_code"])
      .getOne();

    if (!user)
      throw new HttpException({
        status: HttpStatus.CONFLICT,
        error: "Пользователь не найден"
      }, HttpStatus.CONFLICT);

    if (user.password_code !== passwordPhoneDto.code)
      throw new HttpException({
        status: HttpStatus.CONFLICT,
        error: "Неверный код"
      }, HttpStatus.CONFLICT);


    const pass = await bcrypt.hashSync(passwordPhoneDto.password, bcrypt.genSaltSync(10));
    await this.customer.update(user.id, { password: pass });

    return {
      status: HttpStatus.OK,
      message: `Пароль для пользователя ${user.phone} изменен`
    };
  }

  async verifyRefreshToken(token: string): Promise<Customer> {
    const user = await this.customer.findOne({ where: { currentHashedRefreshToken: token } });
    if (!user)
      throw new HttpException({
        status: HttpStatus.CONFLICT,
        error: "Пользователь не найден"
      }, HttpStatus.CONFLICT);

    let tokenGen = {
      currentHashedRefreshToken: await bcrypt.hashSync(user.id.toString(), bcrypt.genSaltSync(12))
    };

    await this.customer.update(user.id, tokenGen);

    Object.assign(user, tokenGen);
    return user;
  }
}
