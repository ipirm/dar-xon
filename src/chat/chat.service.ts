import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ChatRoom } from "../database/entities/chat-room.entity";
import { paginate, Pagination } from "nestjs-typeorm-paginate";
import { CreateChatDto } from "./dto/create-chat.dto";
import { Executor } from "../database/entities/executor.entity";
import { CreateMessageDto } from "./dto/create-message.dto";
import { Message } from "../database/entities/message.entity";
import { AwsService } from "../aws/aws.service";
import { MessagesReadExecutor } from "../database/entities/messages-read-executor.entity";
import { Role } from "../enums/roles.enum";
import { MessagesReadCustomer } from "../database/entities/messages-read-customer.entity";
import { WsException } from "@nestjs/websockets";
import { ChatStatus } from "../enums/chatStatus";

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(ChatRoom) private readonly chat: Repository<ChatRoom>,
    @InjectRepository(Executor) private readonly executor: Repository<Executor>,
    @InjectRepository(Message) private readonly message: Repository<Message>,
    @InjectRepository(MessagesReadExecutor) private readonly messageReadExecutor: Repository<MessagesReadExecutor>,
    @InjectRepository(MessagesReadCustomer) private readonly messagesReadCustomer: Repository<MessagesReadCustomer>,
    private readonly aws: AwsService
  ) {
  }

  async getAll(page, limit, user, search, status): Promise<Pagination<ChatRoom>> {
    const searchText = decodeURI(search).toLowerCase();
    const data = this.chat.createQueryBuilder("chat")
      .select([
        "chat.id",
        "chat.status",
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
      .andWhere("(executors.id = :chh OR customer.id = :chh)", { chh: user.id })

    if (status) {
      data.andWhere("chat.status = :st", { st: status });
    }

    if (search) {
      data.andWhere("LOWER(task.title) ILIKE :value", { value: `%${searchText}%` });
    }

    if (user.role === Role.Executor) {
      data.addSelect(["read_by_executors.id", "read_by_executors.read"]);
      data.leftJoin("messages.read_by_executors", "read_by_executors");
      data.loadRelationCountAndMap(
        "chat.unReadCount",
        "messages.read_by_executors",
        "i",
        qb =>
          qb.andWhere("i.executor.id = :user", { user: user.id })
            .andWhere("i.read = :bl", { bl: false })
      );
    }

    if (user.role === Role.Customer) {
      console.log("customer");
      data.addSelect(["read_by_customers.id", "read_by_customers.read"]);
      data.leftJoin("messages.read_by_customers", "read_by_customers");
      data.loadRelationCountAndMap(
        "chat.unReadCount",
        "messages.read_by_customers",
        "i",
        qb =>
          qb.andWhere("i.customer.id = :user", { user: user.id })
            .andWhere("i.read = :bl", { bl: false })
      );
    }

    const chats = await paginate(data, { page, limit });

    for (const value of chats.items) {
      let message = await this.message.createQueryBuilder("m")
        .select(["m.id", "m.text", "m.createdAt", "executor.id", "executor.fio", "executor.avatar", "customer.id", "customer.fio", "customer.avatar"])
        .leftJoin("m.chat", "c")
        .where("c.id = :id", { id: value.id })
        .leftJoin("m.executor", "executor")
        .leftJoin("m.customer", "customer")
        .orderBy("m.createdAt", "DESC")
        .getOne();
      Object.assign(value, { unReadCount: 0 });
      value.messages.forEach((i) => {
        // @ts-ignore
        value.unReadCount += i.unReadCount;
      });
      delete value.messages;
      Object.assign(value, { message: message });
    }
    return chats;
  }

  async createChat(createChatDto: CreateChatDto, user): Promise<ChatRoom> {
    const executors = await this.executor.findByIds(createChatDto.executors);
    const exist = await this.chat.createQueryBuilder("c")
      .select(["c.id", "customer.id", "executors.id", "task.id"])
      .leftJoin("c.customer", "customer")
      .leftJoin("c.executors", "executors")
      .leftJoin("c.task", "task")
      .andWhere("customer.id = :customer", { customer: user.id })
      .andWhere("task.id = :task", { task: createChatDto.task })
      .andWhere("executors.id IN (:...ids)", { ids: executors.map(i => i.id) })
      .getOne();

    if (exist)
      return exist;

    Object.assign(createChatDto, { customer: user.id });
    createChatDto.executors = executors;
    return await this.chat.save(this.chat.create(createChatDto));
  }

  async getOne(user, id: number): Promise<ChatRoom> {
    return await this.chat.createQueryBuilder("c")
      .select(["c.id", "e.id", "b.id", "c.status"])
      .leftJoin("c.executors", "e")
      .leftJoin("c.customer", "b")
      .andWhere("(e.id = :exe OR b.id = :exe)", { exe: user.id })
      .andWhere("c.id = :id", { id: id })
      .getOne();
  }

  async saveMessage(createMessageDto: CreateMessageDto): Promise<Message> {
    const room = await this.chat.createQueryBuilder("c")
      .select(["c.id", "e.id", "b.id", "c.status"])
      .leftJoin("c.executors", "e")
      .leftJoin("c.customer", "b")
      .andWhere("(e.id = :exe OR b.id = :cus)", { exe: createMessageDto.executor, cus: createMessageDto.customer })
      .andWhere("c.id = :id", { id: createMessageDto.chat })
      .getOne();

    // if (room.status === ChatStatus.Archive)
    //   throw new WsException("Чат архивирован");

    if (!room)
      throw new WsException("У вас нет доступа к чату");

    const message = await this.message.save(this.message.create(createMessageDto));

    for (const item of room.executors) {
      await this.messageReadExecutor.save(this.messageReadExecutor.create({
        message: message,
        executor: item,
        read: item.id == createMessageDto.executor
      }));
    }

    await this.messagesReadCustomer.save(this.messagesReadCustomer.create({
      message: message,
      customer: room.customer,
      read: room.customer.id == createMessageDto.customer
    }));

    return this.message.createQueryBuilder("m")
      .select([
        "m.id",
        "m.text",
        "m.file",
        "m.createdAt",
        "m.m_type",
        "e.id",
        "e.avatar",
        "e.fio",
        "e.rating",
        "c.id",
        "c.avatar",
        "c.fio"
      ])
      .where("m.id = :id", { id: message.id })
      .leftJoin("m.customer", "c")
      .leftJoin("m.executor", "e")
      .getOne();
  }

  async getMessages(page, limit, id, user, started): Promise<Pagination<Message>> {
    let unRead = null;

    const messages = this.message.createQueryBuilder("m")
      .select([
        "m.m_type",
        "m.file",
        "m.id",
        "m.text",
        "m.createdAt",
        "chat.id",
        "executor.id",
        "executor.fio",
        "executor.avatar",
        "customer.id",
        "customer.fio",
        "customer.avatar"
      ])
      .leftJoin("m.chat", "chat")
      .leftJoin("m.executor", "executor")
      .leftJoin("m.customer", "customer")
      .andWhere("chat.id = :id", { id: id })
      .orderBy("m.createdAt", "DESC");

    if (started) {
      console.log("stated")
      messages.andWhere("task.createdAt < :start_at", { start_at: started });
    }

    if (user.role === Role.Executor) {
      console.log("executor")
      messages.addSelect(["rbe.id", "rbe.read"]);
      messages.leftJoin("m.read_by_executors", "rbe", "rbe.executor.id = :user", { user: user.id });

      unRead = await this.messageReadExecutor.createQueryBuilder("m")
        .select(["m.id", "message.id", "executor.id", "chat.id","m.read"])
        .leftJoin("m.message", "message")
        .leftJoin("message.chat", "chat")
        .andWhere("chat.id = :ch", { ch: id })
        .leftJoin("m.executor", "executor")
        .andWhere("executor.id = :user", { user: user.id })
        .andWhere("m.read = :rd",{rd: false})
        .getMany();

      for (const value of unRead) {
        await this.messageReadExecutor.update(value.id, { read: true });
      }
    }
    if (user.role === Role.Customer) {
      messages.addSelect(["rbc.id", "rbc.read"]);
      messages.leftJoin("m.read_by_customers", "rbc", "rbc.customer.id = :user", { user: user.id });

      unRead = await this.messagesReadCustomer.createQueryBuilder("m")
        .select(["m.id", "message.id", "customer.id", "chat.id","m.read"])
        .leftJoin("m.message", "message")
        .leftJoin("message.chat", "chat")
        .andWhere("chat.id = :ch", { ch: id })
        .leftJoin("m.customer", "customer")
        .andWhere("customer.id = :user", { user: user.id })
        .andWhere("m.read = :rd",{rd: false})
        .getMany();

      for (const value of unRead) {
        await this.messagesReadCustomer.update(value.id, { read: true });
      }
    }


    const data = await paginate(messages, { page, limit });
    Object.assign(data.meta, { timestamp: new Date() });
    return data;
  }

  async setMessagesRead(ids: Array<any>, user): Promise<void> {
    let unRead = null;

    if (user.role === Role.Executor) {
      unRead = await this.messageReadExecutor.createQueryBuilder("m")
        .select(["m.id", "message.id", "executor.id"])
        .leftJoin("m.message", "message")
        .andWhere("message.id IN (:...ids)", { ids: ids })
        .leftJoin("m.executor", "executor")
        .andWhere("executor.id = :user", { user: user.id })
        .getMany();
    }

    if (user.role === Role.Customer) {
      unRead = await this.messageReadExecutor.createQueryBuilder("m")
        .select(["m.id", "message.id", "customer.id"])
        .leftJoin("m.message", "message")
        .andWhere("message.id IN (:...ids)", { ids: ids })
        .leftJoin("m.customer", "customer")
        .andWhere("customer.id = :user", { user: user.id })
        .getMany();
    }

    for (const value of unRead) {
      await this.messageReadExecutor.update(value.id, { read: true });
    }

    return null;
  }

  async saveFile(files): Promise<any> {
    const data = await this.aws.uploadPublicFile(files.file[0]);
    return { url: data.url, name: data.key };
  }

  async getUnreadCount(user): Promise<any> {
    let data: any = null;
    if (user.role === Role.Executor) {
      data = await this.messageReadExecutor.createQueryBuilder("m")
        .select(["m.id", "executor.id"])
        .leftJoin("m.executor", "executor")
        .andWhere("executor.id = :id", { id: user.id })
        .andWhere("m.read = :read", { read: false })
        .getCount();
    }

    if (user.role === Role.Customer) {
      data = await this.messagesReadCustomer.createQueryBuilder("m")
        .select(["m.id", "customer.id"])
        .leftJoin("m.customer", "customer")
        .andWhere("customer.id = :id", { id: user.id })
        .andWhere("m.read = :read", { read: false })
        .getCount();
    }
    return {
      unReadCount: data
    };
  }
}
