import { IsString, Matches } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class ConfirmPhoneDto {

  @ApiProperty({ example: "100", description: "ID пользователя", required: false })
  @IsString()
  user_id: string;

  @ApiProperty({ example: "+994503190044", description: "Номер", required: false })
  @IsString()
  phone: string;

}