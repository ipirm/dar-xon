import { IsString, Matches } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class RegistrationExecutorDto {

  @ApiProperty({ example: "79853633344", description: "Номер, Хардкод-смс: 123456", required: false })
  @Matches(/([+])\w+/g, { message: "Номер должен начинаться с символа '+'" })
  phone: string;

  @ApiProperty({ example: "Ilham564/", description: "Пароль", required: false })
  @Matches(/^(?=.*[A-Z])(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&\/\ ]{8,}$/g, { message: "Пароль должен содержать большие и маленькие латинские буквы, специальные символы и быть не короче 8 символов" })
  password: string;

  @ApiProperty({ example: "w33haaa", description: "Логин", required: false })
  @IsString()
  login: string;

  @ApiProperty({ example: "ilham.pirm@gmail.com", description: "Мейл", required: false })
  @IsString()
  email: string;

}