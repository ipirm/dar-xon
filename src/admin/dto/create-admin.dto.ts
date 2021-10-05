import { IsEmail, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateAdminDto {

  @ApiProperty({ example: "ilham.pirm2@gmail.com", description: "Почта, Хардкод-смс: 123456", required: false })
  @IsEmail()
  email: string;

  @ApiProperty({ example: "79853633344", description: "Пароль", required: false })
  @IsString()
  password: string;

  @ApiProperty({ example: "Ильхам Пираммамедов Вугар оглы", description: "ФИО", required: false })
  @IsString()
  fio: string;
}