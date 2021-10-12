import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiCreatedResponse, ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { SignInDto } from "./dto/sign-in.dto";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { UserDecorator } from "../decorators/user.decorator";
import { Role } from "../enums/roles.enum";
import { ConfirmDto } from "./dto/confirm.dto";
import { RegistrationCustomerDto } from "./dto/registration-customer.dto";
import { RegistrationExecutorDto } from "./dto/registration-executor.dto";


@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {
  }

  @ApiOperation({ summary: "Зарегестироваться как заказчик" })
  @ApiCreatedResponse({ type: RegistrationCustomerDto })
  @Post("registration/customer")
  registrationCustomer(
    @Body() registrationCustomerDto: RegistrationCustomerDto
  ): Promise<any> {
    return this.auth.registrationCustomer(registrationCustomerDto);
  }

  @ApiOperation({ summary: "Зарегестироваться как исполнитель" })
  @ApiCreatedResponse({ type: RegistrationExecutorDto })
  @Post("registration/executor")
  registrationExecutor(
    @Body() registrationExecutorDto: RegistrationExecutorDto
  ): Promise<any> {
    return this.auth.registrationExecutor(registrationExecutorDto);
  }

  @ApiOperation({ summary: "Потвердить номер или почту" })
  @ApiCreatedResponse({ type: ConfirmDto })
  @ApiParam({ name: "role", enum: Role })
  @Post("confirm/:role")
  confirmNumber(
    @Body() confirmDto: ConfirmDto,
    @Param("role") role: Role = Role.Customer
  ): Promise<any> {
    return this.auth.confirmNumber(confirmDto, role);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Получить статусы и количество задач" })
  @ApiParam({ name: "role", enum: Role })
  @Get("tasks/:role")
  getAllTasksByStatus(
    @UserDecorator() user: any,
    @Param("status") status: any
  ): Promise<any> {
    return this.auth.getAllTasksByStatus(user, status);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Пользователь онлайн" })
  @Get("status/online")
  setOnline(
    @UserDecorator() user: any
  ): Promise<any> {
    return this.auth.setOnline(user);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Пользователь оффлайн" })
  @Get("status/offline")
  setOffline(
    @UserDecorator() user: any
  ): Promise<any> {
    return this.auth.setOffline(user);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Получить профиль" })
  @Get("profile")
  getProfile(
    @UserDecorator() user: any
  ): Promise<any> {
    return this.auth.profile(user);
  }

  @ApiOperation({ summary: "Войти" })
  @ApiCreatedResponse({ type: SignInDto })
  @ApiParam({ name: "role", enum: Role })
  @Post("login/:role")
  signIn(
    @Body() signInDto: SignInDto,
    @Param("role") role: Role = Role.Customer
  ): Promise<any> {
    return this.auth.signIn(signInDto, role);
  }
}
