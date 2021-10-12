import { ApiProperty } from "@nestjs/swagger";
import { IsEnum } from "class-validator";
import { ApiModelProperty } from "@nestjs/swagger/dist/decorators/api-model-property.decorator";
import { MessageType } from "../../enums/messageType";

export class CreateMessageDto {

  @ApiProperty({ example: 1, description: "Id чата", required: false })
  chat: any;

  @ApiProperty({ example: "Some text here", description: "text", required: false })
  text: string;

  @ApiProperty({ type: "string", format: "binary", description: "Файл" })
  file: any;

  @ApiProperty({ example: 1, description: "исполнитель", required: false })
  executor?: any;

  @ApiProperty({ example: 1, description: "заказчик", required: false })
  customer?: any;

  @ApiModelProperty({
    enum: Object.keys(MessageType),
    default: MessageType.Text,
    description: "тип сообщения"
  })
  m_type: MessageType;


}