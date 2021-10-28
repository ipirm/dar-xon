import { IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class EmailRequestDto {

  @ApiProperty({ example: "ilham.pirm@gmail.com", description: "Почта", required: false })
  @IsString()
  email: string;

}