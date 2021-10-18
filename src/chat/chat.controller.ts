import { Body, Controller, Get, Param, Post, Query, UploadedFiles, UseGuards, UseInterceptors } from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags
} from "@nestjs/swagger";
import { ApiImplicitQuery } from "@nestjs/swagger/dist/decorators/api-implicit-query.decorator";
import { Pagination } from "nestjs-typeorm-paginate";
import { ChatService } from "./chat.service";
import { ChatRoom } from "../database/entities/chat-room.entity";
import { CreateChatDto } from "./dto/create-chat.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { UserDecorator } from "../decorators/user.decorator";
import { Message } from "../database/entities/message.entity";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { CreateFileDto } from "./dto/create-file.dto";

@ApiTags("Chat")
@Controller("chat")
export class ChatController {
  constructor(
    private readonly chat: ChatService
  ) {
  }

  @ApiBearerAuth()
  @ApiQuery({
    name: "search",
    required: false,
    type: String,
    example: "Test task 3"
  })
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
    @UserDecorator() user: any,
    @Query("search") search: string
  ): Promise<Pagination<ChatRoom>> {
    return this.chat.getAll(page, limit, user,search);
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


  @Post("/upload-file")
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(FileFieldsInterceptor([
    { name: "file", maxCount: 1 }
  ]))
  @ApiOperation({ summary: "Отправка Файла в чат" })
  @ApiCreatedResponse({ type: CreateFileDto })
  saveFile(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body() createFileDto: CreateFileDto
  ): Promise<any> {
    return this.chat.saveFile(files);
  }


  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get("unread-messages/count")
  @ApiOperation({ summary: "Получение кол-ва непрочитанных" })
  getUnreadCount(
    @UserDecorator() user: any
  ): Promise<any> {
    return this.chat.getUnreadCount(user);
  }
}
