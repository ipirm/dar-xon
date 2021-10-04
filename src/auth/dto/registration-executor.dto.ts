import { IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class RegistrationExecutorDto {

  @ApiProperty({ example: "79853633344", description: "Номер, Хардкод-смс: 123456", required: false })
  @IsString()
  phone: string;
}