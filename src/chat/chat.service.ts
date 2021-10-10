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
    return await this.message.save(this.message.create(createMessageDto));
  }

  async getMessages(page, limit, id, user): Promise<Pagination<Message>> {
    const messages = await this.message.createQueryBuilder("m")
      .select(["m.id", "m.text", "m.read", "m.createdAt", "chat.id", "executor.id", "executor.fio", "executor.avatar", "customer.id", "customer.fio", "customer.avatar"])
      .leftJoin("m.chat", "chat")
      .leftJoin("m.executor", "executor")
      .leftJoin("m.customer", "customer")
      .where("chat.id = :id", { id: id })
      .orderBy("m.createdAt", "ASC");

    return await paginate(messages, { page, limit });
  }

  // async getChat(id: number): Promise<ChatRoom> {
  //   return await this.chat.findOne(id);
  // }
}
