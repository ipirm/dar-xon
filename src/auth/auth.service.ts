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

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private customer: CustomerService,
    private executor: ExecutorService,
    private readonly admin: AdminService,
    private readonly aws: AwsService,
    @InjectRepository(Mail) private readonly contact: Repository<Mail>,
    private readonly mailerService: MailerService
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


  async confirmRequestNumber(confirmPhoneDto: ConfirmPhoneDto, user): Promise<any> {

    console.log(user);
    console.log(confirmPhoneDto);
  }

  async registrationExecutor(registrationExecutorDto: RegistrationExecutorDto): Promise<any> {
    const user = await this.executor.registrationExecutor(registrationExecutorDto);
    return { id: user.id, role: Role.Executor };
  }


  async confirmNumber(confirmDto: ConfirmDto, role: Role): Promise<any> {
    let user: any = null;

    if (role === Role.Customer)
      user = await this.customer.confirmNumber(confirmDto);

    if (role === Role.Executor)
      user = await this.executor.confirmNumber(confirmDto);

    return { ...user, role: role };
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
      access_token: this.jwtService.sign({ ...user, role })
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

}
