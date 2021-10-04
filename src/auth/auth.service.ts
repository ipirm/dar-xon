import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { SignInDto } from "./dto/sign-in.dto";
import { CustomerService } from "../customer/customer.service";
import { Role } from "../enums/roles.enum";
import { ExecutorService } from "../executor/executor.service";
import { ConfirmDto } from "./dto/confirm.dto";
import { RegistrationExecutorDto } from "./dto/registration-executor.dto";
import { RegistrationCustomerDto } from "./dto/registration-customer.dto";

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private customer: CustomerService,
    private executor: ExecutorService
  ) {
  }

  async profile(user: any): Promise<any> {
    let loggedUser: any = null;

    if (user.role === "customer")
      loggedUser = await this.customer.getOne(user.id);

    if (user.role === "executor")
      loggedUser = await this.executor.getOne(user.id);

    return { ...loggedUser, ...{ role: user.role } };
  }


  async registrationCustomer(registrationCustomerDto: RegistrationCustomerDto): Promise<any> {
    const user = await this.customer.registrationCustomer(registrationCustomerDto);
    return { ...user, role: Role.Customer };
  }

  async registrationExecutor(registrationExecutorDto: RegistrationExecutorDto): Promise<any> {
    const user = await this.executor.registrationExecutor(registrationExecutorDto);
    return { ...user, role: Role.Executor };
  }

  async confirmNumber(confirmDto: ConfirmDto, role: Role): Promise<any> {
    let user: any = null;
    if (role === "customer")
      user = await this.customer.confirmNumber(confirmDto);

    if (role === "executor")
      user = await this.executor.confirmNumber(confirmDto);

    return { ...user, role: role };
  }

  async signIn(signInDto: SignInDto, role: Role): Promise<any> {
    let user: any = null;

    if (role === "customer")
      user = await this.customer.findOne(signInDto.nickname, signInDto.password);

    if (role === "executor")
      user = await this.executor.findOne(signInDto.nickname, signInDto.password);

    return {
      access_token: this.jwtService.sign({ ...user, role })
    };
  }

}
