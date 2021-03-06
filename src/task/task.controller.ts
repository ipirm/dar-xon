import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors
} from "@nestjs/common";
import { TaskService } from "./task.service";
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiTags
} from "@nestjs/swagger";
import { Pagination } from "nestjs-typeorm-paginate";
import { Task } from "../database/entities/task.entity";
import { CreateTaskDto } from "./dto/create-task.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { UserDecorator } from "../decorators/user.decorator";
import { RolesGuard } from "../auth/guards/roles.guard";
import { hasRoles } from "../decorators/roles.decorator";
import { Role } from "../enums/roles.enum";
import { FilesInterceptor } from "@nestjs/platform-express";
import { TaskResponses } from "../database/entities/taskResponses.entity";
import { CreateResponseDto } from "./dto/create-response.dto";
import { ExecutorTypeTaskEnum } from "../enums/executorTypeTask.enum";
import { StartTaskDto } from "./dto/start-task.dto";
import { DeleteResult, UpdateResult } from "typeorm";
import { CustomerTypeTaskEnum } from "../enums/customerTypeTask.enum";
import { FinishTaskDto } from "./dto/finish-task.dto";


@ApiTags("Task")
@Controller("task")
export class TaskController {
  constructor(
    private readonly task: TaskService
  ) {
  }

  @ApiQuery({
    name: "state",
    required: true,
    enum: CustomerTypeTaskEnum,
    example: CustomerTypeTaskEnum.All
  })
  @ApiQuery({
    name: "search",
    required: false,
    type: String,
    example: "Test task 3"
  })
  @ApiQuery({
    name: "started",
    required: false,
    type: String,
    example: "2021-10-08T06:31:16.544Z"
  })
  @ApiQuery({
    name: "finished",
    required: false,
    type: String,
    example: "2021-10-08T06:31:16.544Z"
  })
  @ApiQuery({
    name: "criteria",
    required: false,
    type: String,
    example: "7,12,14"
  })
  @ApiQuery({
    name: "cat",
    required: false,
    type: String,
    example: "33,34,35"
  })
  @ApiQuery({
    name: "task_type",
    required: false,
    type: String,
    example: "1,2,3"
  })
  @ApiQuery({
    name: "page",
    required: false,
    type: Number,
    example: 1
  })
  @ApiQuery({
    name: "limit",
    required: false,
    type: Number,
    example: 10
  })
  @ApiQuery({
    name: "participants_count",
    required: false,
    type: Boolean
  })
  @ApiOperation({ summary: "???????????????? ?????? ????????????" })
  @Get("")
  getAll(
    @Query("state") state: ExecutorTypeTaskEnum = ExecutorTypeTaskEnum.All,
    @Query("page") page: number = 1,
    @Query("limit") limit: number = 100,
    @Query("search") search: string,
    @Query("started") started: string,
    @Query("criteria") criteria: string,
    @Query("cat") cat: string,
    @Query("task_type") taskType: string,
    @Query("participants_count") participantsCount: Boolean,
    @Query("finished") finished: string
  ): Promise<Pagination<Task>> {
    return this.task.getAll(state, page, limit, search, started, criteria, cat, taskType, participantsCount,finished);
  }


  @ApiBearerAuth()
  @ApiConsumes("multipart/form-data")
  @ApiOperation({ summary: "?????????????? ????????????" })
  @ApiCreatedResponse({ type: CreateTaskDto })
  @hasRoles(Role.Customer)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseInterceptors(FilesInterceptor("files", 10, {
    limits: {
      fileSize: 30000000
    }
  }))
  @Post("")
  createTask(
    @Body() createTaskDto: CreateTaskDto,
    @UserDecorator() user: any,
    @UploadedFiles() files: Array<Express.Multer.File>
  ): Promise<Task> {
    return this.task.createTask(createTaskDto, user, files);
  }

  @ApiBearerAuth()
  @ApiConsumes("multipart/form-data")
  @ApiOperation({ summary: "???????????????? ????????????" })
  @ApiCreatedResponse({ type: CreateTaskDto })
  @ApiParam({ name: "id", example: 4, type: Number })
  @hasRoles(Role.Customer,Role.Admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseInterceptors(FilesInterceptor("files", 10, {
    limits: {
      fileSize: 30000000
    }
  }))
  @Put(":id")
  updateTask(
    @Body() createTaskDto: CreateTaskDto,
    @UserDecorator() user: any,
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Param("id") id: number
  ): Promise<UpdateResult> {
    return this.task.updateTask(createTaskDto, user, files, id);
  }

  @ApiBearerAuth()
  @hasRoles(Role.Executor)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post("response")
  @ApiCreatedResponse({ type: CreateResponseDto })
  @ApiOperation({ summary: "???????????????????????? ???? ????????????" })
  executorTask(
    @Body() createResponseDto: CreateResponseDto,
    @UserDecorator() user: any
  ): Promise<TaskResponses> {
    return this.task.executeTask(createResponseDto, user);
  }


  @ApiQuery({
    name: "state",
    required: true,
    enum: CustomerTypeTaskEnum,
    example: CustomerTypeTaskEnum.All
  })
  @ApiQuery({
    name: "search",
    required: false,
    type: String,
    example: "Test task 3"
  })
  @ApiQuery({
    name: "started",
    required: false,
    type: String,
    example: "2021-10-08T06:31:16.544Z"
  })
  @ApiQuery({
    name: "finished",
    required: false,
    type: String,
    example: "2021-10-08T06:31:16.544Z"
  })
  @ApiQuery({
    name: "criteria",
    required: false,
    type: String,
    example: "7,12,14"
  })
  @ApiQuery({
    name: "cat",
    required: false,
    type: String,
    example: "33,34,35"
  })
  @ApiQuery({
    name: "page",
    required: false,
    type: Number,
    example: 1
  })
  @ApiQuery({
    name: "limit",
    required: false,
    type: Number,
    example: 10
  })
  @ApiQuery({
    name: "task_type",
    required: false,
    type: String,
    example: "1,2,3"
  })
  @ApiQuery({
    name: "participants_count",
    required: false,
    type: Boolean
  })
  @ApiBearerAuth()
  @hasRoles(Role.Executor)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get("executor/list")
  @ApiOperation({ summary: "???????????????? ?????? ???????????? ??????????????????????" })
  getAllExecutorTasks(
    @UserDecorator() user: any,
    @Query("state") state: ExecutorTypeTaskEnum = ExecutorTypeTaskEnum.All,
    @Query("page") page: number = 1,
    @Query("limit") limit: number = 100,
    @Query("search") search: string,
    @Query("started") started: string,
    @Query("criteria") criteria: string,
    @Query("cat") cat: string,
    @Query("task_type") taskType: string,
    @Query("participants_count") participantsCount: Boolean,
    @Query("finished") finished: string
  ): Promise<Pagination<Task>> {
    return this.task.getAllExecutorTasks(user, state, page, limit, search, started, criteria, cat, taskType, participantsCount,finished);
  }

  @ApiQuery({
    name: "state",
    required: true,
    enum: CustomerTypeTaskEnum,
    example: CustomerTypeTaskEnum.All
  })
  @ApiQuery({
    name: "search",
    required: false,
    type: String,
    example: "Test task 3"
  })
  @ApiQuery({
    name: "started",
    required: false,
    type: String,
    example: "2021-10-08T06:31:16.544Z"
  })
  @ApiQuery({
    name: "finished",
    required: false,
    type: String,
    example: "2021-10-08T06:31:16.544Z"
  })
  @ApiQuery({
    name: "criteria",
    required: false,
    type: String,
    example: "7,12,14"
  })
  @ApiQuery({
    name: "cat",
    required: false,
    type: String,
    example: "33,34,35"
  })
  @ApiQuery({
    name: "page",
    required: false,
    type: Number,
    example: 1
  })
  @ApiQuery({
    name: "limit",
    required: false,
    type: Number,
    example: 10
  })
  @ApiQuery({
    name: "task_type",
    required: false,
    type: String,
    example: "1,2,3"
  })
  @ApiQuery({
    name: "participants_count",
    required: false,
    type: Boolean
  })
  @ApiBearerAuth()
  @hasRoles(Role.Customer)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get("customer/list")
  @ApiOperation({ summary: "???????????????? ?????? ???????????? ??????????????????" })
  getAllCustomerTasks(
    @UserDecorator() user: any,
    @Query("state") state: CustomerTypeTaskEnum = CustomerTypeTaskEnum.All,
    @Query("page") page: number = 1,
    @Query("limit") limit: number = 100,
    @Query("search") search: string,
    @Query("started") started: string,
    @Query("criteria") criteria: string,
    @Query("cat") cat: string,
    @Query("task_type") taskType: string,
    @Query("participants_count") participantsCount: Boolean,
    @Query("finished") finished: string
  ): Promise<Pagination<Task>> {
    return this.task.getAllCustomerTasks(user, state, page, limit, search, started, criteria, cat, taskType, participantsCount,finished);
  }

  @ApiBearerAuth()
  @hasRoles(Role.Customer)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post("start")
  @ApiCreatedResponse({ type: StartTaskDto })
  @ApiOperation({ summary: "?????????????? ??????????????????????" })
  startTask(
    @Body() startTaskDto: StartTaskDto,
    @UserDecorator() user: any
  ): Promise<Task> {
    return this.task.startTask(startTaskDto, user);
  }

  @ApiBearerAuth()
  @hasRoles(Role.Customer)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post("finish")
  @ApiCreatedResponse({ type: FinishTaskDto })
  @ApiOperation({ summary: "?????????????????? ????????????" })
  finishTask(
    @Body() finishTaskDto: FinishTaskDto,
    @UserDecorator() user: any
  ): Promise<UpdateResult> {
    return this.task.finishTask(finishTaskDto, user);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(":id")
  @ApiOperation({ summary: "???????????????? ???????????? ???? id" })
  @ApiParam({ name: "id" })
  getOne(
    @Param("id") id: number,
    @UserDecorator() user: any
  ): Promise<any> {
    return this.task.findOne(id, user);
  }

  @ApiBearerAuth()
  @hasRoles(Role.Customer)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(":id")
  @ApiOperation({ summary: "?????????????? ????????????" })
  deleteCustomer(
    @Param("id") id: number,
    @UserDecorator() user: any
  ): Promise<DeleteResult> {
    return this.task.deleteTask(id, user);
  }
}
