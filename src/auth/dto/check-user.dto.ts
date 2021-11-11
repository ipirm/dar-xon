import { IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CheckUserDto {

  @ApiProperty({ example: "w33haaa", description: "Логин", required: false })
  @IsString()
  login: string;

  @ApiProperty({ example: "ilham.pirm@gmail.com", description: "Почта", required: false })
  @IsString()
  email: string;

  @ApiProperty({ example: "+994503190044", description: "Номер", required: false })
  @IsString()
  phone: string;
}