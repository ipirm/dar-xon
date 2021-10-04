import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { Task } from "../database/entities/task.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { DeleteResult, Repository, UpdateResult } from "typeorm";
import { paginate, Pagination } from "nestjs-typeorm-paginate";
import { CreateTaskDto } from "./dto/create-task.dto";
import { AwsService } from "../aws/aws.service";
import { TaskResponses } from "../database/entities/taskResponses.entity";
import { CreateResponseDto } from "./dto/create-response.dto";
import { ExecutorTypeTaskEnum } from "../enums/executorTypeTask.enum";
import { StartTaskDto } from "./dto/start-task.dto";
import { TaskStatusEnum } from "../enums/taskStatus.enum";
import { CustomerTypeTaskEnum } from "../enums/customerTypeTask.enum";
import { Executor } from "../database/entities/executor.entity";

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task) private readonly task: Repository<Task>,
    @InjectRepository(TaskResponses) private readonly response: Repository<TaskResponses>,
    @InjectRepository(Executor) private readonly executor: Repository<Executor>,
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

  async startTask(startTaskDto: StartTaskDto, user): Promise<Task> {
    const task = await this.task.createQueryBuilder("task")
      .where("task.id = :id", { id: startTaskDto.task })
      .leftJoinAndSelect("task.created_by", "created_by")
      .getOne();

    if (task.created_by.id !== user.id)
      throw new HttpException({
        status: HttpStatus.FORBIDDEN,
        error: "Вы не являетесь создателем данной задачи"
      }, HttpStatus.FORBIDDEN);

    if (task.participants <= startTaskDto.executors.length)
      throw new HttpException({
        status: HttpStatus.FORBIDDEN,
        error: `У задачи максимально ${task.participants} исполнителя`
      }, HttpStatus.FORBIDDEN);

    const executors = await this.executor.findByIds(startTaskDto.executors);

    await this.task.update(task.id, this.task.create({
      startedAt: new Date(),
      status: TaskStatusEnum.Started
    }));
    return await this.task.save({ id: task.id, executors: executors });
  }

  async finishTask(startTaskDto: StartTaskDto, user): Promise<UpdateResult> {
    const task = await this.task.createQueryBuilder("task")
      .where("task.id = :id", { id: startTaskDto.task })
      .leftJoinAndSelect("task.executors", "executors")
      .leftJoinAndSelect("task.created_by", "created_by")
      .getOne();

    if (!task.executors)
      throw new HttpException({
        status: HttpStatus.FORBIDDEN,
        error: "У задачи нет исполнителей"
      }, HttpStatus.FORBIDDEN);

    if (task.created_by.id !== user.id)
      throw new HttpException({
        status: HttpStatus.FORBIDDEN,
        error: "Вы не являетесь создателем данной задачи"
      }, HttpStatus.FORBIDDEN);



    return  await this.task.update(task.id, this.task.create({
      status: TaskStatusEnum.Finished
    }));;
  }

  async getAllExecutorTasks(user, state: ExecutorTypeTaskEnum, page, limit, search): Promise<Pagination<Task>> {
    const searchText = decodeURI(search).toLowerCase();

    const data = await this.task.createQueryBuilder("task")
      .select([
        "task.id",
        "task.title",
        "task.createdAt",
        "task.finishedAt",
        "task.files",
        "task.description",
        "task.site",
        "task.status",
        "created_by.id",
        "created_by.fio",
        "created_by.avatar",
        "parent.id",
        "parent.name",
        "category.id",
        "category.name",
        "executor.id",
        "responses.id",
        "executor1.id"
      ])
      .leftJoin("task.created_by", "created_by")
      .leftJoin("task.category", "category")
      .leftJoin("category.parent", "parent")
      .leftJoin("task.executor", "executor")
      .leftJoin("task.responses", "responses")
      .leftJoin("responses.executor", "executor1")
      .andWhere("LOWER(task.title) ILIKE :value", { value: `%${searchText}%` })
      .loadRelationCountAndMap("task.responsesCount", "task.responses", "responses");

    if (state === "execution") {
      data.andWhere("task.status = :started", { started: "started" });
      data.andWhere("executor.id = :executor", { executor: user.id });
    }

    if (state === "consideration") {
      data.andWhere("task.status = :started", { started: "started" });
      data.andWhere("executor1.id = :executor1", { executor1: user.id });
    }

    if (state === "archive") {
      data.andWhere("task.status = :archive", { started: "finished" });
      data.andWhere("executor.id = :executor", { executor: user.id });

    }

    if (state === "all") {
      data.andWhere("task.status = :started", { started: "created" });
    }

    return paginate(data, { page, limit });
  }

  async getAllCustomerTasks(user, state: CustomerTypeTaskEnum, page, limit, search): Promise<Pagination<Task>> {
    const searchText = decodeURI(search).toLowerCase();

    const data = await this.task.createQueryBuilder("task")
      .select([
        "task.id",
        "task.title",
        "task.createdAt",
        "task.finishedAt",
        "task.files",
        "task.description",
        "task.site",
        "task.status",
        "created_by.id",
        "created_by.fio",
        "created_by.avatar",
        "parent.id",
        "parent.name",
        "category.id",
        "category.name"
      ])
      .leftJoin("task.created_by", "created_by")
      .leftJoin("task.category", "category")
      .leftJoin("category.parent", "parent")
      .andWhere("LOWER(task.title) ILIKE :value", { value: `%${searchText}%` })
      .loadRelationCountAndMap("task.responsesCount", "task.responses", "responses");

    if (state === "active") {
      data.andWhere("(task.status = :started OR task.status = :created) ", { started: "started", created: "created" });
      data.andWhere("created_by.id = :created_by", { created_by: user.id });
    }


    if (state === "archive") {
      data.andWhere("task.status = :archive", { archive: "archive" });
      data.andWhere("created_by.id = :created_by", { created_by: user.id });
    }

    if (state === "all") {
      data.andWhere("task.status = :started", { started: "created" });
    }

    return paginate(data, { page, limit });

  }

  async deleteTask(id: number): Promise<DeleteResult> {
    return await this.task.delete(id);
  }

  async findOne(id: number, user): Promise<any> {
    let data = await this.task.createQueryBuilder("task")
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

    if (data.created_by.id == user.id) {
      data = await this.task.createQueryBuilder("task")
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
          "category.name",
          "responses.id",
          "responses.comment",
          "executor.id",
          "executor.avatar",
          "executor.fio",
          "executor.rating"
        ])
        .where("task.id = :id", { id: id })
        .leftJoin("task.created_by", "created_by")
        .leftJoin("task.category", "category")
        .leftJoin("category.parent", "parent")
        .leftJoin("task.responses", "responses")
        .leftJoin("responses.executor", "executor")
        .leftJoinAndSelect("task.executors", "executors")
        .loadRelationCountAndMap("task.responsesCount", "task.responses", "responses")
        .getOne();
    }

    return data;
  }

}
