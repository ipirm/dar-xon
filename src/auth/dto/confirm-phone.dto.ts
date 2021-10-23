import { IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class ConfirmPhoneDto {

  @ApiProperty({ example: "+994503190044", description: "Номер", required: false })
  @IsString()
  phone: string;
}