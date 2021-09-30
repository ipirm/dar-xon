import { IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class ConfirmDto {

  @ApiProperty({ example: "100", description: "ID пользователя", required: false })
  @IsString()
  user_id: string;

  @ApiProperty({ example: "123456", description: "Номер, Хардкод-смс: 123456", required: false })
  @IsString()
  value: string;
}