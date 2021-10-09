import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ChatRoom } from "../database/entities/chat-room.entity";
import { paginate, Pagination } from "nestjs-typeorm-paginate";
import { CreateChatDto } from "./dto/create-chat.dto";
import { Executor } from "../database/entities/executor.entity";

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatRoom) private readonly chat: Repository<ChatRoom>,
    @InjectRepository(Executor) private readonly executor: Repository<Executor>
  ) {
  }

  async getAll(page, limit): Promise<Pagination<ChatRoom>> {
    const data = this.chat.createQueryBuilder("chat")
      .leftJoinAndSelect("chat.executors","executors")
      .leftJoinAndSelect("chat.task","task")
      .leftJoinAndSelect("chat.customer","customer")
    return paginate(data, { page, limit });
  }

  async createChat(createChatDto: CreateChatDto, user): Promise<ChatRoom> {
    Object.assign(createChatDto, { customer: user.id });
    const executors = await this.executor.findByIds(createChatDto.executors);
    createChatDto.executors = executors;
    return await this.chat.save(this.chat.create(createChatDto));
  }
}
