import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { SignInDto } from "./dto/sign-in.dto";
import { CustomerService } from "../customer/customer.service";
import { Role } from "../enums/roles.enum";
import { ExecutorService } from "../executor/executor.service";
import { ConfirmDto } from "./dto/confirm.dto";
import { RegistrationExecutorDto } from "./dto/registration-executor.dto";
import { RegistrationCustomerDto } from "./dto/registration-customer.dto";
import { AdminService } from "../admin/admin.service";
import { Mail } from "../database/entities/mail.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateContactDto } from "./dto/create-contact.dto";
import { AwsService } from "../aws/aws.service";
import { MailerService } from "@nestjs-modules/mailer";
import { ConfirmPhoneDto } from "./dto/confirm-phone.dto";
import { HttpService } from "@nestjs/axios";
import { map } from "rxjs";
import { ConfirmEmailRequestDto } from "./dto/confirm-email-request.dto";
import { ConfirmEmailDto } from "./dto/confirm-email.dto";
import { EmailRequestDto } from "./dto/email-request.dto";
import { PasswordDto } from "./dto/password.dto";
import { PhoneRequestDto } from "./dto/phone-request.dto";
import { PasswordPhoneDto } from "./dto/password-phone.dto";
import { RefreshTokenDto } from "./dto/refresh-token.dto";
import { CheckUserDto } from "./dto/check-user.dto";

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private customer: CustomerService,
    private executor: ExecutorService,
    private readonly admin: AdminService,
    private readonly aws: AwsService,
    @InjectRepository(Mail) private readonly contact: Repository<Mail>,
    private readonly mailerService: MailerService,
    private readonly httpService: HttpService
  ) {
  }

  async profile(user: any): Promise<any> {
    let loggedUser: any = null;

    if (user.role === Role.Customer)
      loggedUser = await this.customer.getOne(user.id);

    if (user.role === Role.Executor)
      loggedUser = await this.executor.getOne(user.id);

    if (user.role === Role.Admin)
      loggedUser = await this.admin.getOne(user.id);


    return { ...loggedUser, ...{ role: user.role } };
  }

  async registrationCustomer(registrationCustomerDto: RegistrationCustomerDto): Promise<any> {
    const user = await this.customer.registrationCustomer(registrationCustomerDto);
    return { id: user.id, role: Role.Customer };
  }

  async confirmRequestNumber(confirmPhoneDto: ConfirmPhoneDto, role: Role): Promise<any> {
    const random = Math.floor(100000 + Math.random() * 900000);

    if (role === Role.Executor)
      await this.executor.updateConfirmNumber(confirmPhoneDto.user_id, random);

    if (role === Role.Customer)
      await this.customer.updateConfirmNumber(confirmPhoneDto.user_id, random);

    return this.httpService.get(`https://sms.ru/sms/send?api_id=${process.env.SMS_API_ID}&to=${confirmPhoneDto.phone.substring(1)}&msg=${random}&json=1`)
      .pipe(
        map(response => response.data)
      );
  }

  async confirmRequestEmail(confirmEmailRequestDto: ConfirmEmailRequestDto, role: Role): Promise<any> {
    const random = Math.floor(100000 + Math.random() * 900000);

    if (role === Role.Executor)
      await this.executor.updateConfirmEmail(confirmEmailRequestDto.user_id, random);

    if (role === Role.Customer)
      await this.customer.updateConfirmEmail(confirmEmailRequestDto.user_id, random);


    return this.httpService.get(
      `https://api.unisender.com/ru/api/sendEmail?format=json&api_key=${process.env.API_UNISENDER}&email=${confirmEmailRequestDto.email}&sender_name=1dar&sender_email=${process.env.SENDER_EMAIL}&subject=%D0%9F%D0%BE%D0%B4%D1%82%D0%B2%D0%B5%D1%80%D0%B6%D0%B4%D0%B5%D0%BD%D0%B8%D0%B5%20%D0%BF%D0%BE%D1%87%D1%82%D1%8B&body=%D0%92%D0%B0%D1%88%20%D0%BA%D0%BE%D0%B4%20%D0%B0%D0%BA%D1%82%D0%B8%D0%B2%D0%B0%D1%86%D0%B8%D0%B8%3A%20${random}&list_id=1`)
      .pipe(
        map(response => response.data)
      );
  }

  async confirmEmail(confirmEmailDto: ConfirmEmailDto, role: Role): Promise<any> {
    let user: any = null;

    if (role === Role.Customer)
      user = await this.customer.confirmEmail(confirmEmailDto);

    if (role === Role.Executor)
      user = await this.executor.confirmEmail(confirmEmailDto);

    return { ...user, role: role };
  }

  async confirmNumber(confirmDto: ConfirmDto, role: Role): Promise<any> {
    console.log(confirmDto)
    let user: any = null;

    if (role === Role.Customer)
      user = await this.customer.confirmNumber(confirmDto);

    if (role === Role.Executor)
      user = await this.executor.confirmNumber(confirmDto);

    return { ...user, role: role };
  }

  async registrationExecutor(registrationExecutorDto: RegistrationExecutorDto): Promise<any> {
    const user = await this.executor.registrationExecutor(registrationExecutorDto);
    return { id: user.id, role: Role.Executor };
  }

  async signIn(signInDto: SignInDto, role: Role): Promise<any> {
    let user: any = null;

    if (role === Role.Customer)
      user = await this.customer.findOne(signInDto.nickname, signInDto.password);

    if (role === Role.Executor)
      user = await this.executor.findOne(signInDto.nickname, signInDto.password);

    if (role === Role.Admin)
      user = await this.admin.findOneSign(signInDto.nickname, signInDto.password);

    return {
      access_token: this.jwtService.sign({ ...user, role }),
      refresh_token: user?.currentHashedRefreshToken
    };

  }

  async getAllTasksByStatus(user): Promise<any> {
    let data;
    if (user.role === Role.Customer)
      data = this.customer.getTasksStatus(user);
    if (user.role === Role.Executor)
      data = this.executor.getTasksStatus(user);
    return data;
  }

  async contactUs(createContactDto: CreateContactDto, user, files): Promise<Mail> {
    const images: Array<any> = [];
    if (files) {
      for (const value of files) {
        const file = await this.aws.uploadPublicFile(value);
        images.push({ url: file.url, name: file.key });
      }
      Object.assign(createContactDto, { files: images });
    }
    if (user.role === Role.Customer) {
      Object.assign(createContactDto, { customer: user.id });
    }
    if (user.role === Role.Executor) {
      Object.assign(createContactDto, { executor: user.id });
    }
    return await this.contact.save(this.contact.create(createContactDto));
  }

  async requestNewPassword(emailRequestDto: EmailRequestDto, role: Role): Promise<any> {
    const random = Math.floor(100000 + Math.random() * 900000);

    if (role === Role.Customer)
      await this.customer.requestNewPassword(emailRequestDto, random);

    if (role === Role.Executor)
      await this.executor.requestNewPassword(emailRequestDto, random);


    return this.httpService.get(
      `https://api.unisender.com/ru/api/sendEmail?format=json&api_key=${process.env.API_UNISENDER}&email=${emailRequestDto.email}&sender_name=1dar&sender_email=${process.env.SENDER_EMAIL}&subject=%D0%A1%D0%B1%D1%80%D0%BE%D1%81%D0%B8%D1%82%D1%8C%20%D0%BF%D0%B0%D1%80%D0%BE%D0%BB%D1%8C&body=%D0%92%D0%B0%D1%88%20%D0%BA%D0%BE%D0%B4%20%D0%B0%D0%BA%D1%82%D0%B8%D0%B2%D0%B0%D1%86%D0%B8%D0%B8%3A%20${random}&list_id=1`)
      .pipe(
        map(response => response.data)
      );

  }

  async confirmNewPassword(passwordDto: PasswordDto, role: Role): Promise<any> {
    let user;

    if (role === Role.Customer)
      user = await this.customer.confirmNewPassword(passwordDto);

    if (role === Role.Executor)
      user = await this.executor.confirmNewPassword(passwordDto);

    return user;
  }

  async requestNewPasswordPhone(phoneRequestDto: PhoneRequestDto, role: Role): Promise<any> {
    const random = Math.floor(100000 + Math.random() * 900000);

    if (role === Role.Customer)
      await this.customer.requestNewPasswordPhone(phoneRequestDto, random);

    if (role === Role.Executor)
      await this.executor.requestNewPasswordPhone(phoneRequestDto, random);

    return this.httpService.get(`https://sms.ru/sms/send?api_id=${process.env.SMS_API_ID}&to=${phoneRequestDto.phone}&msg=${random}&json=1`)
      .pipe(
        map(response => response.data)
      );
  }

  async confirmNewPasswordPhone(passwordPhoneDto: PasswordPhoneDto, role: Role): Promise<any> {
    let user;

    if (role === Role.Customer)
      user = await this.customer.confirmNewPasswordPhone(passwordPhoneDto);

    if (role === Role.Executor)
      user = await this.executor.confirmNewPasswordPhone(passwordPhoneDto);

    return user;
  }

  async verifyRefreshToken(refreshTokenDto: RefreshTokenDto, role: Role): Promise<any> {
    let user: any = null;

    if (role === Role.Customer)
      user = await this.customer.verifyRefreshToken(refreshTokenDto.token);

    if (role === Role.Executor)
      user = await this.executor.verifyRefreshToken(refreshTokenDto.token);

    if (role === Role.Admin)
      user = await this.admin.verifyRefreshToken(refreshTokenDto.token);

    return {
      access_token: this.jwtService.sign({ ...user, role }),
      refresh_token: user?.currentHashedRefreshToken
    };
  }

  async checkUserExist(checkUserDto: CheckUserDto, role: Role): Promise<any> {
    let user: any;

    if (role === Role.Customer)
      user = await this.customer.findOneByParams(checkUserDto);

    if (role === Role.Executor)
      user = await this.executor.findOneByParams(checkUserDto);

    return user;

  }
}
