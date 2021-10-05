import { IsEmail, IsString, Matches } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class RegistrationCustomerDto {

  @ApiProperty({ example: "ilham.pirm2@gmail.com", description: "Почта, Хардкод-смс: 123456", required: false })
  @IsEmail()
  email: string;

  @ApiProperty({ example: "+994503190044", description: "Номер", required: false })
  @IsString()
  phone: string;

  @ApiProperty({ example: "Ilham564/", description: "Пароль", required: false })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, { message: "1 заглавная буква, 1 символ, не менее 6 символов" })
  password: string;

  @ApiProperty({ example: "w33haaa", description: "Логин", required: false })
  @IsString()
  login: string;
}