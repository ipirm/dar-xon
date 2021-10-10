import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ChatRoom } from "../database/entities/chat-room.entity";
import { paginate, Pagination } from "nestjs-typeorm-paginate";
import { CreateChatDto } from "./dto/create-chat.dto";
import { Executor } from "../database/entities/executor.entity";
import { CreateMessageDto } from "./dto/create-message.dto";
import { Message } from "../database/entities/message.entity";

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatRoom) private readonly chat: Repository<ChatRoom>,
    @InjectRepository(Executor) private readonly executor: Repository<Executor>,
    @InjectRepository(Message) private readonly message: Repository<Message>
  ) {
  }

  async getAll(page, limit, user): Promise<Pagination<ChatRoom>> {
    const data = this.chat.createQueryBuilder("chat")
      .leftJoinAndSelect("chat.executors", "executors")
      .leftJoinAndSelect("chat.task", "task")
      .leftJoinAndSelect("chat.customer", "customer")
      .leftJoinAndSelect("chat.messages", "messages")
      .leftJoinAndSelect("messages.executor", "executor")
      .leftJoinAndSelect("messages.customer", "customer1")
      .where("chat.customer = :id OR executors.id = :id", { id: user.id });
    return paginate(data, { page, limit });
  }

  async createChat(createChatDto: CreateChatDto, user): Promise<ChatRoom> {
    Object.assign(createChatDto, { customer: user.id });
    const executors = await this.executor.findByIds(createChatDto.executors);
    createChatDto.executors = executors;
    return await this.chat.save(this.chat.create(createChatDto));
  }

  async getOne(id: number): Promise<any> {
    return await this.chat.findOne(id);
  }

  async getChats(): Promise<any> {

  }

  async saveMessage(createMessageDto: CreateMessageDto): Promise<Message> {
    console.log(createMessageDto);
    return await this.message.save(this.message.create(createMessageDto));
  }
}
