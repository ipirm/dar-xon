import { IsNumber, IsString, Matches } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class PasswordPhoneDto {

  @ApiProperty({ example: 123456, description: "Код", required: false })
  @IsNumber()
  code: number;

  @ApiProperty({ example: "Ilham564/", description: "Пароль", required: false })
  @Matches(/^(?=.*[A-Z])(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{6,}$/, { message: "1 заглавная буква, 1 символ, не менее 6 символов" })
  password: string;

  @ApiProperty({ example: "+994503190044", description: "Почта", required: false })
  @IsString()
  phone: string;
}