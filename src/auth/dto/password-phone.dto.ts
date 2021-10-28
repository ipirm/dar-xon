import { IsNumber, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class PasswordPhoneDto {

  @ApiProperty({ example: 123456, description: "Код", required: false })
  @IsNumber()
  code: number;

  @ApiProperty({ example: "Ilham564/", description: "Пароль", required: false })
  @IsString()
  password: string;

  @ApiProperty({ example: "+994503190044", description: "Почта", required: false })
  @IsString()
  phone: string;
}