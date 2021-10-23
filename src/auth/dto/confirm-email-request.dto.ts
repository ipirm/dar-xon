import { IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class ConfirmEmailRequestDto {

  @ApiProperty({ example: "100", description: "ID пользователя", required: false })
  @IsString()
  user_id: string;

  @ApiProperty({ example: "ihlam.pirm@gmail.com", description: "Почта", required: false })
  @IsString()
  email: string;
}