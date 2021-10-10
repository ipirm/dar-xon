import { ApiProperty } from "@nestjs/swagger";

export class CreateMessageDto {

  @ApiProperty({ example: 1, description: "Id чата", required: false })
  chat: any;

  @ApiProperty({ example: "Some text here", description: "text", required: false })
  text: string;

  @ApiProperty({ example: 1, description: "исполнитель", required: false })
  executor?: any;

  @ApiProperty({ example: 1, description: "заказчик", required: false })
  customer?: any;

  @ApiProperty({ example: true, description: "прочитано", required: false })
  read: Boolean;
}