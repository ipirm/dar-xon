import { Body, Controller, Get, Param, Post, Req, UploadedFiles, UseGuards, UseInterceptors } from "@nestjs/common";
import { ApiBearerAuth, ApiConsumes, ApiCreatedResponse, ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { SignInDto } from "./dto/sign-in.dto";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { UserDecorator } from "../decorators/user.decorator";
import { Role } from "../enums/roles.enum";
import { ConfirmDto } from "./dto/confirm.dto";
import { RegistrationCustomerDto } from "./dto/registration-customer.dto";
import { RegistrationExecutorDto } from "./dto/registration-executor.dto";
import { FilesInterceptor } from "@nestjs/platform-express";
import { CreateContactDto } from "./dto/create-contact.dto";
import { Mail } from "../database/entities/mail.entity";
import { ConfirmPhoneDto } from "./dto/confirm-phone.dto";
import { RateLimit } from "nestjs-rate-limiter";
import { ConfirmEmailRequestDto } from "./dto/confirm-email-request.dto";
import { ConfirmEmailDto } from "./dto/confirm-email.dto";
import { EmailRequestDto } from "./dto/email-request.dto";
import { PasswordDto } from "./dto/password.dto";
import { PhoneRequestDto } from "./dto/phone-request.dto";
import { PasswordPhoneDto } from "./dto/password-phone.dto";
import { RefreshTokenDto } from "./dto/refresh-token.dto";
import { Recaptcha, RecaptchaResult } from "@nestlab/google-recaptcha";
import { GoogleRecaptchaValidationResult } from "@nestlab/google-recaptcha/interfaces/google-recaptcha-validation-result";


@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {
  }

  @ApiOperation({ summary: "Зарегестироваться как заказчик" })
  @ApiCreatedResponse({ type: RegistrationCustomerDto })
  @Recaptcha()
  @Post("registration/customer")
  registrationCustomer(
    @Body() registrationCustomerDto: RegistrationCustomerDto
  ): Promise<any> {
    return this.auth.registrationCustomer(registrationCustomerDto);
  }

  @ApiOperation({ summary: "Зарегестироваться как исполнитель" })
  @ApiCreatedResponse({ type: RegistrationExecutorDto })
  @Recaptcha()
  @Post("registration/executor")
  registrationExecutor(
    @Body() registrationExecutorDto: RegistrationExecutorDto,
    @Req() req: Request
  ): Promise<any> {
    console.log(req.headers);
    return this.auth.registrationExecutor(registrationExecutorDto);
  }


  @ApiOperation({ summary: "Запросить подтверждения номера" })
  @ApiCreatedResponse({ type: ConfirmPhoneDto })
  @ApiParam({ name: "role", enum: Role, example: Role.Executor })
  @RateLimit({
    keyPrefix: "request-confirm",
    points: 1,
    duration: 60,
    errorMessage: "Смс можно запрашивать не раньше чем раз в минуту"
  })
  @Post("request-confirm-phone/:role")
  confirmRequestNumber(
    @Body() confirmPhoneDto: ConfirmPhoneDto,
    @Param("role") role: Role = Role.Customer
  ): Promise<any> {
    return this.auth.confirmRequestNumber(confirmPhoneDto, role);
  }

  @ApiOperation({ summary: "Подтвердить номер" })
  @ApiCreatedResponse({ type: ConfirmDto })
  @ApiParam({ name: "role", enum: Role, example: Role.Executor })
  @Post("confirm-phone/:role")
  confirmNumber(
    @Body() confirmDto: ConfirmDto,
    @Param("role") role: Role = Role.Customer
  ): Promise<any> {
    return this.auth.confirmNumber(confirmDto, role);
  }

  @ApiOperation({ summary: "Запросить подтверждения почты" })
  @ApiCreatedResponse({ type: ConfirmEmailRequestDto })
  @ApiParam({ name: "role", enum: Role, example: Role.Executor })
  @RateLimit({
    keyPrefix: "request-confirm",
    points: 1,
    duration: 60,
    errorMessage: "Смс можно запрашивать не раньше чем раз в минуту"
  })
  @Post("request-confirm-email/:role")
  confirmRequestEmail(
    @Body() confirmEmailRequestDto: ConfirmEmailRequestDto,
    @Param("role") role: Role = Role.Customer
  ): Promise<any> {
    return this.auth.confirmRequestEmail(confirmEmailRequestDto, role);
  }

  @ApiOperation({ summary: "Подтвердить почту" })
  @ApiCreatedResponse({ type: ConfirmEmailDto })
  @ApiParam({ name: "role", enum: Role, example: Role.Executor })
  @Post("confirm-email/:role")
  confirmEmail(
    @Body() confirmEmailDto: ConfirmEmailDto,
    @Param("role") role: Role = Role.Customer
  ): Promise<any> {
    return this.auth.confirmEmail(confirmEmailDto, role);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Получить статусы и количество задач,отзывы" })
  @ApiParam({ name: "role", enum: Role })
  @Get("tasks/:role")
  getAllTasksByStatus(
    @UserDecorator() user: any
  ): Promise<any> {
    return this.auth.getAllTasksByStatus(user);
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
  @Recaptcha()
  @Post("login/:role")
  signIn(
    @Body() signInDto: SignInDto,
    @Param("role") role: Role = Role.Customer,
    @RecaptchaResult() recaptchaResult: GoogleRecaptchaValidationResult
  ): Promise<any> {
    console.log(recaptchaResult)
    return this.auth.signIn(signInDto, role);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiConsumes("multipart/form-data")
  @ApiOperation({ summary: "Отправить форму обратной связи" })
  @ApiCreatedResponse({ type: CreateContactDto })
  @UseInterceptors(FilesInterceptor("files", 10))
  @Post("/send-form")
  contactUs(
    @Body() createContactDto: CreateContactDto,
    @UserDecorator() user: any,
    @UploadedFiles() files: Array<Express.Multer.File>
  ): Promise<Mail> {
    return this.auth.contactUs(createContactDto, user, files);
  }

  @ApiOperation({ summary: "Запросить сброс пароля почта" })
  @ApiCreatedResponse({ type: EmailRequestDto })
  @ApiParam({ name: "role", enum: Role, example: Role.Executor })
  @Post("request-new-password-email/:role")
  requestNewPasswordEmail(
    @Body() emailRequestDto: EmailRequestDto,
    @Param("role") role: Role = Role.Customer
  ): Promise<any> {
    return this.auth.requestNewPassword(emailRequestDto, role);
  }

  @ApiOperation({ summary: "Сбросить пароль почта" })
  @ApiCreatedResponse({ type: PasswordDto })
  @ApiParam({ name: "role", enum: Role, example: Role.Executor })
  @Post("confirm-new-password-email/:role")
  confirmNewPassword(
    @Body() passwordDto: PasswordDto,
    @Param("role") role: Role = Role.Customer
  ): Promise<any> {
    return this.auth.confirmNewPassword(passwordDto, role);
  }

  @ApiOperation({ summary: "Запросить сброс пароля номер" })
  @ApiCreatedResponse({ type: PhoneRequestDto })
  @ApiParam({ name: "role", enum: Role, example: Role.Executor })
  @Post("request-new-password-phone/:role")
  requestNewPasswordPhone(
    @Body() phoneRequestDto: PhoneRequestDto,
    @Param("role") role: Role = Role.Customer
  ): Promise<any> {
    return this.auth.requestNewPasswordPhone(phoneRequestDto, role);
  }

  @ApiOperation({ summary: "Сбросить пароль номер" })
  @ApiCreatedResponse({ type: PasswordPhoneDto })
  @ApiParam({ name: "role", enum: Role, example: Role.Executor })
  @Post("confirm-new-password-phone/:role")
  confirmNewPasswordPhone(
    @Body() passwordPhoneDto: PasswordPhoneDto,
    @Param("role") role: Role = Role.Customer
  ): Promise<any> {
    return this.auth.confirmNewPasswordPhone(passwordPhoneDto, role);
  }

  @ApiOperation({ summary: "Войти с помощью Refresh Token" })
  @ApiCreatedResponse({ type: RefreshTokenDto })
  @ApiParam({ name: "role", enum: Role })
  @Post("login-refresh-token/:role")
  signInWithRefresh(
    @Body() refreshTokenDto: RefreshTokenDto,
    @Param("role") role: Role = Role.Customer
  ): Promise<any> {
    return this.auth.verifyRefreshToken(refreshTokenDto, role);
  }
}
