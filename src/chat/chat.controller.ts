import { Body, Controller, Get, Param, Post, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiCreatedResponse, ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";
import { ApiImplicitQuery } from "@nestjs/swagger/dist/decorators/api-implicit-query.decorator";
import { Pagination } from "nestjs-typeorm-paginate";
import { ChatService } from "./chat.service";
import { ChatRoom } from "../database/entities/chat-room.entity";
import { CreateChatDto } from "./dto/create-chat.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { UserDecorator } from "../decorators/user.decorator";
import { Message } from "../database/entities/message.entity";

@ApiTags("Chat")
@Controller("chat")
export class ChatController {
  constructor(
    private readonly chat: ChatService
  ) {
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get("")
  @ApiOperation({ summary: "Получить все чаты" })
  @ApiImplicitQuery({
    name: "page",
    required: false,
    type: Number
  })
  @ApiImplicitQuery({
    name: "limit",
    required: false,
    type: Number
  })
  getAll(
    @Query("page") page: number = 1,
    @Query("limit") limit: number = 100,
    @UserDecorator() user: any
  ): Promise<Pagination<ChatRoom>> {
    return this.chat.getAll(page, limit, user);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get("/chat-item/:id")
  @ApiOperation({ summary: "Получить все сообщения чата по id" })
  @ApiImplicitQuery({
    name: "page",
    required: false,
    type: Number
  })
  @ApiImplicitQuery({
    name: "limit",
    required: false,
    type: Number
  })
  @ApiParam({ name: "id", example: 4, type: Number })
  getMessages(
    @Query("page") page: number = 1,
    @Query("limit") limit: number = 100,
    @Param("id") id: number = 4,
    @UserDecorator() user: any
  ): Promise<Pagination<Message>> {
    return this.chat.getMessages(page, limit, id,user);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post("")
  @ApiOperation({ summary: "Создать чат" })
  @ApiCreatedResponse({ type: CreateChatDto })
  createChat(
    @Body() createChatDto: CreateChatDto,
    @UserDecorator() user: any
  ): Promise<ChatRoom> {
    return this.chat.createChat(createChatDto, user);
  }
}
