import { IsEmail } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class RegistrationCustomerDto {

  @ApiProperty({ example: "ilham.pirm2@gmail.com", description: "Почта, Хардкод-смс: 123456", required: false })
  @IsEmail()
  email: string;
}