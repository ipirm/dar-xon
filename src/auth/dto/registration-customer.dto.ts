import { IsEmail, IsEmpty, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class RegistrationCustomerDto {

  @ApiProperty({ example: "ilham.pirm2@gmail.com", description: "Почта, Хардкод-смс: 123456", required: false })
  @IsEmail()
  email: string;

  @ApiProperty({ example: "+994503190044", description: "Почта, Хардкод-смс: 123456", required: false })
  @IsString()
  phone: string;

  @ApiProperty({ example: "Ilham564/", description: "Почта, Хардкод-смс: 123456", required: false })
  @IsEmpty()
  password: string;
}