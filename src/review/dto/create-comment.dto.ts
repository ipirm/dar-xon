import { IsNumber, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";


export class CreateCommentDto {

  @IsString()
  @ApiProperty({ example: "Some text oveer here", description: "comment", required: false })
  comment: string;

  @IsNumber()
  @ApiProperty({ example: 1, description: "ID Отзыва", required: false })
  review: any;
}