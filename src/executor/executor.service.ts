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
import { ConfirmEmailDto } from "../auth/dto/confirm-email.dto";
import { EmailRequestDto } from "../auth/dto/email-request.dto";
import { PasswordDto } from "../auth/dto/password.dto";
import { PhoneRequestDto } from "../auth/dto/phone-request.dto";
import { PasswordPhoneDto } from "../auth/dto/password-phone.dto";

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
    let email = false;
    let phone = false;

    let data = await this.executor.createQueryBuilder("executor")
      .where("executor.phone = :phone OR executor.login = :login", {
        phone: createExecutorDto.phone,
        login: createExecutorDto.login,
        email: createExecutorDto.email
      }).getOne();

    if (data) {
      if (data.confirmed_email) {
        email = true;
      } else {
        await this.executor.update(data.id, { email: null });
      }
      if (data.confirmed_phone) {
        phone = true;
      } else {
        await this.executor.update(data.id, { phone: null });
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

    if (data?.login === createExecutorDto.login)
      throw new HttpException({
        status: HttpStatus.CONFLICT,
        error: "Данный логин уже зарегестрирован"
      }, HttpStatus.CONFLICT);

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
        Object.assign(full, { [key]: value });
      }
    }
    Object.assign(user, { fullness: Math.ceil(Object.entries(full).length / Object.entries(user).length * 100) });
    return user;
  }

  async updateExecutor(id: number, createExecutorDto: CreateExecutorDto, files: Express.Multer.File[]): Promise<UpdateResult> {
    let email = false;
    let phone = false;
    let login = false;

    if (createExecutorDto.email) {
      const data = await this.executor.findOne({ where: { email: createExecutorDto.email } });
      if (data) {
        if (data.confirmed_email) {
          email = true;
        } else {
          await this.executor.update(data.id, { email: null });
          await this.executor.update(id, { confirmed_email: false });
        }
      }
    }

    if (createExecutorDto.phone) {
      const data = await this.executor.findOne({ where: { phone: createExecutorDto.phone } });
      if (data) {
        if (data.confirmed_phone) {
          phone = true;
        } else {
          await this.executor.update(data.id, { phone: null });
          await this.executor.update(id, { confirmed_phone: false });
        }
      }
    }

    if (createExecutorDto.login) {
      const data = await this.executor.findOne({ where: { login: createExecutorDto.login } });
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
        error: "Данный номер уже зарегестрирован"
      }, HttpStatus.CONFLICT);

    if (login)
      throw new HttpException({
        status: HttpStatus.CONFLICT,
        error: "Данный логин уже зарегестрирован"
      }, HttpStatus.CONFLICT);

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
      .addSelect(["executor.password", "executor.banned", "executor.currentHashedRefreshToken"])
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

    let tokenGen = {
      currentHashedRefreshToken: await bcrypt.hashSync(user.id.toString(), bcrypt.genSaltSync(12))
    };

    await this.executor.update(user.id, tokenGen);

    Object.assign(user, tokenGen);

    return user;
  }

  async registrationExecutor(registrationExecutorDto: RegistrationExecutorDto): Promise<Executor> {
    let email = false;
    let phone = false;

    let data = await this.executor.createQueryBuilder("executor")
      .where("executor.phone = :phone OR executor.login = :login", {
        phone: registrationExecutorDto.phone,
        login: registrationExecutorDto.login,
        email: registrationExecutorDto.email
      }).getOne();

    if (data) {
      if (data.confirmation_email) {
        email = true;
      } else {
        await this.executor.update(data.id, { email: null });
      }
      if (data.confirmation_phone) {
        phone = true;
      } else {
        await this.executor.update(data.id, { phone: null });
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

    if (data?.login === registrationExecutorDto.login)
      throw new HttpException({
        status: HttpStatus.CONFLICT,
        error: "Данный логин уже зарегестрирован"
      }, HttpStatus.CONFLICT);

    return await this.executor.save(this.executor.create(registrationExecutorDto));
  }

  async confirmNumber(confirmDto: ConfirmDto): Promise<Executor> {
    const user = await this.executor.createQueryBuilder("e")
      .where("e.id = :id", { id: confirmDto.user_id })
      .addSelect(["e.confirmation_phone"])
      .getOne();


    if (user.confirmation_phone !== confirmDto.value || confirmDto.value === 363547)
      throw new HttpException({
        status: HttpStatus.CONFLICT,
        error: "Неверный код"
      }, HttpStatus.CONFLICT);

    await this.executor.update(user.id, { confirmed_phone: true });
    return await this.executor.findOne(confirmDto.user_id);
  }

  async confirmEmail(confirmEmailDto: ConfirmEmailDto): Promise<Executor> {
    const user = await this.executor.createQueryBuilder("e")
      .where("e.id = :id", { id: confirmEmailDto.user_id })
      .addSelect(["e.confirmation_email"])
      .getOne();


    if (user.confirmation_email !== confirmEmailDto.value || confirmEmailDto.value === 363547)
      throw new HttpException({
        status: HttpStatus.CONFLICT,
        error: "Неверный код"
      }, HttpStatus.CONFLICT);

    await this.executor.update(user.id, { confirmed_email: true });
    return await this.executor.findOne(confirmEmailDto.user_id);
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

  async updateConfirmNumber(user, authCode: number): Promise<UpdateResult> {
    return await this.executor.update(user, { confirmation_phone: authCode });
  }

  async updateConfirmEmail(user, authCode: number): Promise<UpdateResult> {
    return await this.executor.update(user, { confirmation_email: authCode });
  }

  async requestNewPassword(emailRequestDto: EmailRequestDto, emailCode: number): Promise<any> {
    const user = await this.executor.createQueryBuilder("c")
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

    await this.executor.update(user.id, { password_code: emailCode });

    return {
      status: HttpStatus.OK,
      message: `Код выслан на почту ${user.email}`
    };
  }

  async confirmNewPassword(passwordDto: PasswordDto): Promise<any> {
    const user = await this.executor.createQueryBuilder("c")
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
    await this.executor.update(user.id, { password: pass });

    return {
      status: HttpStatus.OK,
      message: `Пароль для пользователя ${user.email} изменен`
    };
  }

  async requestNewPasswordPhone(phoneRequestDto: PhoneRequestDto, phoneCode: number): Promise<any> {
    const user = await this.executor.createQueryBuilder("c")
      .where("c.phone = :phone", { phone: phoneRequestDto.phone })
      .getOne();

    if (!user)
      throw new HttpException({
        status: HttpStatus.CONFLICT,
        error: "Пользователь не найден"
      }, HttpStatus.CONFLICT);

    await this.executor.update(user.id, { password_code: phoneCode });

  }

  async confirmNewPasswordPhone(passwordPhoneDto: PasswordPhoneDto): Promise<any> {
    const user = await this.executor.createQueryBuilder("c")
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
    await this.executor.update(user.id, { password: pass });

    return {
      status: HttpStatus.OK,
      message: `Пароль для пользователя ${user.phone} изменен`
    };
  }

  async verifyRefreshToken(token: string): Promise<Executor> {
    const user = await this.executor.findOne({ where: { currentHashedRefreshToken: token } });
    if (!user)
      throw new HttpException({
        status: HttpStatus.CONFLICT,
        error: "Пользователь не найден"
      }, HttpStatus.CONFLICT);

    let tokenGen = {
      currentHashedRefreshToken: await bcrypt.hashSync(user.id.toString(), bcrypt.genSaltSync(12))
    };

    await this.executor.update(user.id, tokenGen);

    Object.assign(user, tokenGen);
    return user;
  }
}
