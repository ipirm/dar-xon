import { IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class SignInDto {

  @IsString()
  @ApiProperty({ example: "ilham.pirm2@gmail.com", description: "Почта или Номер", required: true })
  nickname: string;

  @IsString()
  @ApiProperty({ example: "Ilham564/", description: "Пароль", required: true })
  password: string;
}