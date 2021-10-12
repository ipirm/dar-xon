import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ChatRoom } from "../database/entities/chat-room.entity";
import { paginate, Pagination } from "nestjs-typeorm-paginate";
import { CreateChatDto } from "./dto/create-chat.dto";
import { Executor } from "../database/entities/executor.entity";
import { CreateMessageDto } from "./dto/create-message.dto";
import { Message } from "../database/entities/message.entity";
import { Role } from "../enums/roles.enum";
import { AwsService } from "../aws/aws.service";

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatRoom) private readonly chat: Repository<ChatRoom>,
    @InjectRepository(Executor) private readonly executor: Repository<Executor>,
    @InjectRepository(Message) private readonly message: Repository<Message>,
    private readonly aws: AwsService
  ) {
  }

  async getAll(page, limit, user, search): Promise<Pagination<ChatRoom>> {
    const searchText = decodeURI(search).toLowerCase();

    const data = this.chat.createQueryBuilder("chat")
      .select([
        "chat.id",
        "executors.id",
        "executors.fio",
        "executors.avatar",
        "task.id",
        "task.title",
        "category.id",
        "category.name",
        "parent.id",
        "parent.name",
        "customer.id",
        "customer.fio",
        "customer.avatar",
        "messages.id"
      ])
      .leftJoin("chat.executors", "executors")
      .leftJoin("chat.task", "task")
      .leftJoin("task.category", "category")
      .leftJoin("category.parent", "parent")
      .leftJoin("chat.customer", "customer")
      .leftJoin("chat.messages", "messages")
      .where("chat.customer = :id OR executors.id = :id", { id: user.id });

    if (search) {
      data.andWhere("LOWER(task.title) ILIKE :value", { value: `%${searchText}%` });
    }

    const chats = await paginate(data, { page, limit });

    for (const value of chats.items) {
      let message = await this.message.createQueryBuilder("m")
        .select(["m.id", "m.text", "m.createdAt"])
        .leftJoin("m.chat", "c")
        .where("c.id = :id", { id: value.id })
        .orderBy("m.createdAt", "ASC")
        .getOne();
      Object.assign(value, { messages: message });
    }
    return chats;
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

  async saveMessage(createMessageDto: CreateMessageDto): Promise<any> {
    const room = await this.chat.createQueryBuilder("c")
      .select(["c.id", "e.id", "b.id"])
      .leftJoin("c.executors", "e")
      .leftJoin("c.customer", "b")
      .getOne();
    Object.assign(createMessageDto, { read_by_customer: Array, read_by_executors: room.executors });
    return await this.message.save(this.message.create(createMessageDto));
  }

  async getMessages(page, limit, id, user): Promise<Pagination<any>> {
    const messages = await this.message.createQueryBuilder("m")
      .select(["customer1.id", "executors1.id", "m.m_type", "m.file", "m.id", "m.text", "m.createdAt", "chat.id", "executor.id", "executor.fio", "executor.avatar", "customer.id", "customer.fio", "customer.avatar"])
      .leftJoin("m.chat", "chat")
      .leftJoin("m.executor", "executor")
      .leftJoin("m.customer", "customer")
      .leftJoin("m.read_by_customer", "customer1")
      .leftJoin("m.read_by_executors", "executors1")
      .where("chat.id = :id", { id: id })
      .orderBy("m.createdAt", "ASC");
    return await paginate(messages, { page, limit });
  }

  async getMessagesUnRead(ids: Array<any>, user): Promise<void> {
    const unRead = await this.message.createQueryBuilder("m")
      .select(["customer1.id", "executors1.id", "m.id", "m.text", "m.createdAt", "chat.id", "executor.id", "executor.fio", "executor.avatar", "customer.id", "customer.fio", "customer.avatar"])
      .leftJoin("m.chat", "chat")
      .leftJoin("m.executor", "executor")
      .leftJoin("m.customer", "customer")
      .leftJoin("m.read_by_customer", "customer1")
      .leftJoin("m.read_by_executors", "executors1")
      .andWhere("m.id IN (:...ids)", { ids: ids })
      .orderBy("m.createdAt", "ASC")
      .getMany();

    if (user.role === Role.Executor) {
      unRead.forEach((i) => {
        i.read_by_executors = i.read_by_executors.filter(v => {
          return v.id !== user.id;
        });
      });
    }
    if (user.role === Role.Customer) {
      unRead.forEach((i) => {
        i.read_by_customer = i.read_by_customer.filter(v => {
          console.log(v.id !== user.id);
          return v.id !== user.id;
        });
      });
    }
    for (const value of unRead) {
      await this.message.save(value);
    }
    return null;
  }

  async saveFile(files): Promise<any> {
    console.log(files.file[0])
    const data = await this.aws.uploadPublicFile(files.file[0]);
    return { url: data.url, name: data.key };
  }
}
