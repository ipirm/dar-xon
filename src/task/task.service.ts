import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { Task } from "../database/entities/task.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { DeleteResult, Repository } from "typeorm";
import { paginate, Pagination } from "nestjs-typeorm-paginate";
import { CreateTaskDto } from "./dto/create-task.dto";
import { AwsService } from "../aws/aws.service";
import { TaskResponses } from "../database/entities/taskResponses.entity";
import { CreateResponseDto } from "./dto/create-response.dto";
import { ExecutorTypeEnum } from "../enums/executorType.enum";
import { StartTaskDto } from "./dto/start-task.dto";
import { TaskStatusEnum } from "../enums/taskStatus.enum";

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task) private readonly task: Repository<Task>,
    @InjectRepository(TaskResponses) private readonly response: Repository<TaskResponses>,
    private readonly aws: AwsService
  ) {
  }

  async getAll(page, limit): Promise<Pagination<Task>> {
    const data = await this.task.createQueryBuilder("task")
      .leftJoinAndSelect("task.category", "category")
      .leftJoinAndSelect("category.parent", "parent")
      .leftJoinAndSelect("task.created_by", "created_by")
      .leftJoinAndSelect("task.responses", "responses")
      .leftJoinAndSelect("responses.executor", "executor");

    return paginate(data, { page, limit });
  }

  async createTask(createTaskDto: CreateTaskDto, user, files: Array<Express.Multer.File>): Promise<Task> {
    const images: any = [];
    if (files) {
      for (const value of files) {
        const file = await this.aws.uploadPublicFile(value);
        images.push({ url: file.url });
      }
      Object.assign(createTaskDto, { files: images });
    }

    Object.assign(createTaskDto, { created_by: user.id });
    return await this.task.save(this.task.create(createTaskDto));
  }

  async executeTask(createResponseDto: CreateResponseDto, user): Promise<TaskResponses> {
    return await this.response.save(this.response.create({
      executor: user.id,
      task: createResponseDto.task,
      comment: createResponseDto.comment
    }));
  }

  async startTask(startTaskDto: StartTaskDto, user): Promise<any> {
    const task = await this.task.createQueryBuilder("task")
      .where("task.id = :id", { id: startTaskDto.task })
      .leftJoinAndSelect("task.executor", "executor")
      .leftJoinAndSelect("task.created_by", "created_by")
      .getOne();

    if (task.executor)
      throw new HttpException({
        status: HttpStatus.FORBIDDEN,
        error: "У задачи уже есть исполнитель"
      }, HttpStatus.FORBIDDEN);

    if (task.created_by.id !== user.id)
      throw new HttpException({
        status: HttpStatus.FORBIDDEN,
        error: "Вы не являетесь создателем данной задачи"
      }, HttpStatus.FORBIDDEN);

    await this.task.update(task.id, this.task.create({
      executor: startTaskDto.executor,
      startedAt: new Date(),
      status: TaskStatusEnum.Started
    }));
    return task;
  }

  async finishTask(startTaskDto: StartTaskDto, user): Promise<any> {
    const task = await this.task.createQueryBuilder("task")
      .where("task.id = :id", { id: startTaskDto.task })
      .leftJoinAndSelect("task.executor", "executor")
      .leftJoinAndSelect("task.created_by", "created_by")
      .getOne();

    if (task.executor)
      throw new HttpException({
        status: HttpStatus.FORBIDDEN,
        error: "У задачи уже есть исполнитель"
      }, HttpStatus.FORBIDDEN);

    if (task.created_by.id !== user.id)
      throw new HttpException({
        status: HttpStatus.FORBIDDEN,
        error: "Вы не являетесь создателем данной задачи"
      }, HttpStatus.FORBIDDEN);

    await this.task.update(task.id, this.task.create({
      executor: startTaskDto.executor,
      status: TaskStatusEnum.Finished
    }));

    return task;
  }


  async getAllExecutorTasks(user, state: ExecutorTypeEnum, page, limit): Promise<any> {
    const data = this.task.createQueryBuilder("task");

    if (state === "execution") {

      

    }
    return state;
  }

  async deleteTask(id: number): Promise<DeleteResult> {
    return await this.task.delete(id);
  }

  async findOne(id: number): Promise<Task> {
    const data = this.task.createQueryBuilder("task")
      .select([
        "task.id",
        "task.title",
        "task.createdAt",
        "task.finishedAt",
        "task.files",
        "task.description",
        "task.site",
        "created_by.id",
        "created_by.fio",
        "created_by.avatar",
        "parent.id",
        "parent.name",
        "category.id",
        "category.name"
      ])
      .where("task.id = :id", { id: id })
      .leftJoin("task.created_by", "created_by")
      .leftJoin("task.category", "category")
      .leftJoin("category.parent", "parent")
      .loadRelationCountAndMap("task.responsesCount", "task.responses", "responses")
      .getOne();

    return data;
  }
}
