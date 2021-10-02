import { IsNumber, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";


export class CreateResponseDto {

  @IsString()
  @ApiProperty({ example: "Some lorem impsum", description: "Коментарий", required: false })
  comment: string;

  @IsNumber()
  @ApiProperty({ example: 8, description: "id задачи", required: true })
  task: any;
}