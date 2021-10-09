import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiCreatedResponse, ApiOperation } from "@nestjs/swagger";
import { ApiImplicitQuery } from "@nestjs/swagger/dist/decorators/api-implicit-query.decorator";
import { Pagination } from "nestjs-typeorm-paginate";
import { ChatService } from "./chat.service";
import { ChatRoom } from "../database/entities/chat-room.entity";
import { CreateChatDto } from "./dto/create-chat.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { UserDecorator } from "../decorators/user.decorator";

@Controller("chat")
export class ChatController {
  constructor(
    private readonly chat: ChatService
  ) {
  }

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
    @Query("limit") limit: number = 100
  ): Promise<Pagination<ChatRoom>> {
    return this.chat.getAll(page, limit);
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
