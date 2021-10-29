import { IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class RefreshTokenDto {

  @ApiProperty({ example: "10010100100", description: "Рефреш токен", required: false })
  @IsString()
  token: string;

}