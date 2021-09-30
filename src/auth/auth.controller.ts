import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { SignInDto } from "./dto/sign-in.dto";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { UserDecorator } from "../decorators/user.decorator";
import { Role } from "../enums/roles.enum";
import { RegistrationDto } from "./dto/registration.dto";
import { ConfirmDto } from "./dto/confirm.dto";


@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {
  }

  @ApiOperation({ summary: "Зарегестироваться" })
  @ApiBody({ type: RegistrationDto })
  @ApiParam({ name: "role", enum: Role })
  @Post("registration/:role")
  Registration(
    @Body() registrationDto: RegistrationDto,
    @Param("role") role: Role = Role.Customer
  ): Promise<any> {
    return this.auth.registration(registrationDto, role);
  }


  @ApiOperation({ summary: "Потвердить номер или почту" })
  @ApiBody({ type: ConfirmDto })
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
  @ApiOperation({ summary: "Получить профиль" })
  @Get("profile")
  getProfile(
    @UserDecorator() user: any
  ): Promise<any> {
    return this.auth.profile(user);
  }

  @ApiOperation({ summary: "Войти" })
  @ApiBody({ type: SignInDto })
  @ApiParam({ name: "role", enum: Role })
  @Post("login/:role")
  signIn(
    @Body() signInDto: SignInDto,
    @Param("role") role: Role = Role.Customer
  ): Promise<any> {
    return this.auth.signIn(signInDto, role);
  }
}
