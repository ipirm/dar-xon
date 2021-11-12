import { IsEmail, IsString, Matches } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class RegistrationDto {

  @ApiProperty({ example: "ilham.pirm2@gmail.com", description: "Почта, Хардкод-смс: 123456", required: false })
  @IsEmail()
  email: string;

  @ApiProperty({ example: "79853633344", description: "Номер, Хардкод-смс: 123456", required: false })
  @Matches(/([+])\w+/g, { message: "Номер должен начинаться с символа '+'" })
  phone: string;
}