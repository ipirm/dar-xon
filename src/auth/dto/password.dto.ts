import { IsNumber, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class PasswordDto {

  @ApiProperty({ example: 123456, description: "Код", required: false })
  @IsNumber()
  code: number;

  @ApiProperty({ example: "Ilham564/", description: "Пароль", required: false })
  @IsString()
  password: string;

  @ApiProperty({ example: "ilham.pirm@gmail.com", description: "Почта", required: false })
  @IsString()
  email: string;
}