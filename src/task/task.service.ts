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
import { CriteriaItem } from "../database/entities/criteria-item.entity";

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task) private readonly task: Repository<Task>,
    @InjectRepository(TaskResponses) private readonly response: Repository<TaskResponses>,
    @InjectRepository(CriteriaItem) private readonly criteria: Repository<CriteriaItem>,
    @InjectRepository(Executor) private readonly executor: Repository<Executor>,
    private readonly aws: AwsService
  ) {
  }

  async getAll(page, limit): Promise<Pagination<Task>> {
    const data = this.task.createQueryBuilder("task")
      .leftJoinAndSelect("task.category", "category")
      .leftJoinAndSelect("category.parent", "parent")
      .leftJoinAndSelect("task.created_by", "created_by")
      .leftJoinAndSelect("task.responses", "responses")
      .leftJoinAndSelect("task.criteria", "criteria")
      .leftJoinAndSelect("task.task_type", "task_type")
      .leftJoinAndSelect("responses.executor", "executor");

    return await paginate(data, { page, limit });
  }

  async createTask(createTaskDto: CreateTaskDto, user, files: Array<Express.Multer.File>): Promise<Task> {
    const images: any = [];
    if (files) {
      for (const value of files) {
        const file = await this.aws.uploadPublicFile(value);
        images.push({ url: file.url, name: file.key });
      }
      Object.assign(createTaskDto, { files: images });
    }
    Object.assign(createTaskDto, { created_by: user.id });
    const criteria = await this.criteria.findByIds(createTaskDto.criteria.split(","));
    Object.assign(createTaskDto, { criteria: criteria });
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

  async getAllExecutorTasks(user, state: ExecutorTypeTaskEnum, page, limit, search, started, criteria, cat): Promise<Pagination<Task>> {
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
        "executors.id",
        "responses.id",
        "executor1.id",
        "criteria.id",
        "criteria.name"
      ])
      .leftJoin("task.created_by", "created_by")
      .leftJoin("task.category", "category")
      .leftJoin("category.parent", "parent")
      .leftJoin("task.executors", "executors")
      .leftJoin("task.responses", "responses")
      .leftJoin("responses.executor", "executor1")
      .leftJoin("task.criteria", "criteria")
      .leftJoinAndSelect("task.task_type", "task_type")
      .loadRelationCountAndMap("task.responsesCount", "task.responses", "responses");

    if (search) {
      data.andWhere("LOWER(task.title) ILIKE :value", { value: `%${searchText}%` });
    }

    if (started) {
      data.andWhere("task.createdAt > :start_at", { start_at: started });
    }

    if (criteria) {
      data.andWhere("criteria.id IN (:...ids)", { ids: [...criteria.split(",")] });
    }
    if (cat) {
      data.andWhere("(category.id IN (:...cat) OR parent.id IN (:...cat))", { cat: [...cat.split(",")] });
    }

    if (state === ExecutorTypeTaskEnum.Execution) {
      data.andWhere("task.status = :started", { started: "started" });
      data.andWhere("executors.id IN (:...executor)", { executor: [user.id] });
    }

    if (state === ExecutorTypeTaskEnum.Сonsideration) {
      data.andWhere("task.status = :started", { started: "started" });
      data.andWhere("executor1.id = :executor1", { executor1: user.id });
    }

    if (state === ExecutorTypeTaskEnum.Archive) {
      data.andWhere("task.status = :archive", { started: "finished" });
      data.andWhere("executor.id = :executor", { executor: user.id });

    }

    if (state === ExecutorTypeTaskEnum.All) {
      data.andWhere("task.status = :started", { started: "created" });
    }

    return paginate(data, { page, limit });
  }

  async getAllCustomerTasks(user, state: CustomerTypeTaskEnum, page, limit, search, started, criteria, cat): Promise<Pagination<Task>> {
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
        "criteria.id",
        "criteria.name"
      ])
      .leftJoin("task.created_by", "created_by")
      .leftJoin("task.category", "category")
      .leftJoin("category.parent", "parent")
      .leftJoin("task.criteria", "criteria")
      .leftJoinAndSelect("task.task_type", "task_type")
      .loadRelationCountAndMap("task.responsesCount", "task.responses", "responses");

    if (started) {
      data.andWhere("task.createdAt > :start_at", { start_at: started });
    }

    if (criteria) {
      data.andWhere("criteria.id IN (:...ids)", { ids: [...criteria.split(",")] });
    }
    if (cat) {
      data.andWhere("(category.id IN (:...cat) OR parent.id IN (:...cat))", { cat: [...cat.split(",")] });
    }

    if (search) {
      data.andWhere("LOWER(task.title) ILIKE :value", { value: `%${searchText}%` });
    }

    console.log(state);
    if (state === CustomerTypeTaskEnum.Execution) {
      data.andWhere("(task.status = :started OR task.status = :created) ", { started: "started", created: "created" });
      data.andWhere("created_by.id = :created_by", { created_by: user.id });
    }


    if (state === CustomerTypeTaskEnum.Archive) {
      data.andWhere("task.status = :archive", { archive: "finished" });
      data.andWhere("created_by.id = :created_by", { created_by: user.id });
    }

    if (state === CustomerTypeTaskEnum.All) {
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
        "category.name",
        "task_type.id",
        "task_type.name",
        "criteria.id",
        "criteria.name"
      ])
      .where("task.id = :id", { id: id })
      .leftJoin("task.created_by", "created_by")
      .leftJoin("task.category", "category")
      .leftJoin("category.parent", "parent")
      .leftJoin("task.task_type", "task_type")
      .leftJoin("task.criteria","criteria")
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
          "executor.rating",
          "task_type.id",
          "task_type.name",
          "criteria.id",
          "criteria.name"
        ])
        .where("task.id = :id", { id: id })
        .leftJoin("task.created_by", "created_by")
        .leftJoin("task.category", "category")
        .leftJoin("task.task_type", "task_type")
        .leftJoin("category.parent", "parent")
        .leftJoin("task.responses", "responses")
        .leftJoin("responses.executor", "executor")
        .leftJoinAndSelect("task.executors", "executors")
        .leftJoin("task.criteria","criteria")
        .loadRelationCountAndMap("task.responsesCount", "task.responses", "responses")
        .getOne();
    }

    return data;
  }

}
