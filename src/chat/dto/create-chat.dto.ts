import { IsArray, IsNumber } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateChatDto {

  @IsNumber()
  @ApiProperty({ example: 1, description: "Id задачи", required: false })
  task: any;

  @IsArray()
  @ApiProperty({ example: [18, 19, 20], description: "Исполнители", required: false })
  executors: any;


  messages: any;
}