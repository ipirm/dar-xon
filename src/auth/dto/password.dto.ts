import { IsNumber, IsString, Matches } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class PasswordDto {

  @ApiProperty({ example: 123456, description: "Код", required: false })
  @IsNumber()
  code: number;

  @ApiProperty({ example: "Ilham564/", description: "Пароль", required: false })
  @Matches(/^(?=.*[A-Z])(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&\/\ ]{8,}$/, { message: "Пароль должен содержать большие и маленькие латинские буквы, специальные символы и быть не короче 8 символов" })
  password: string;

  @ApiProperty({ example: "ilham.pirm@gmail.com", description: "Почта", required: false })
  @IsString()
  email: string;
}