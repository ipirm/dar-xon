import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors
} from "@nestjs/common";
import { TaskService } from "./task.service";
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from "@nestjs/swagger";
import { ApiImplicitQuery } from "@nestjs/swagger/dist/decorators/api-implicit-query.decorator";
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
import { DeleteResult } from "typeorm";
import { CustomerTypeTaskEnum } from "../enums/customerTypeTask.enum";


@ApiTags("Task")
@Controller("task")
export class TaskController {
  constructor(
    private readonly task: TaskService
  ) {
  }

  @Get("")
  @ApiOperation({ summary: "Получить все задачи" })
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
    @Query("limit") limit: number = 100
  ): Promise<Pagination<Task>> {
    return this.task.getAll(page, limit);
  }

  @ApiBearerAuth()
  @hasRoles(Role.Customer)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UseInterceptors(FilesInterceptor("files", 10))
  @Post("")
  @ApiOperation({ summary: "Создать задачу" })
  @ApiBody({ type: CreateTaskDto })
  saveCustomer(
    @Body() createTaskDto: CreateTaskDto,
    @UserDecorator() user: any,
    @UploadedFiles() files: Array<Express.Multer.File>
  ): Promise<Task> {
    return this.task.createTask(createTaskDto, user, files);
  }


  @ApiBearerAuth()
  @hasRoles(Role.Executor)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post("response")
  @ApiBody({ type: CreateResponseDto })
  @ApiOperation({ summary: "Откликнуться на задачу" })
  executorTask(
    @Body() createResponseDto: CreateResponseDto,
    @UserDecorator() user: any
  ): Promise<TaskResponses> {
    return this.task.executeTask(createResponseDto, user);
  }


  @ApiBearerAuth()
  @hasRoles(Role.Executor)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get("executor/list")
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
  @ApiImplicitQuery({
    name: "state",
    required: true,
    enum: ExecutorTypeTaskEnum
  })

  @ApiImplicitQuery({
    name: "search",
    required: false,
    type: String
  })

  @ApiOperation({ summary: "Получить все задачи исполнителя" })
  getAllExecutorTasks(
    @UserDecorator() user: any,
    @Query("state") state: ExecutorTypeTaskEnum = ExecutorTypeTaskEnum.All,
    @Query("page") page: number = 1,
    @Query("limit") limit: number = 100,
    @Query("search") search: number = 100
  ): Promise<Pagination<Task>> {
    return this.task.getAllExecutorTasks(user, state, page, limit, search);
  }

  @ApiBearerAuth()
  @hasRoles(Role.Customer)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get("customer/list")
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
  @ApiImplicitQuery({
    name: "state",
    required: true,
    enum: CustomerTypeTaskEnum
  })

  @ApiImplicitQuery({
    name: "search",
    required: false,
    type: String
  })

  @ApiOperation({ summary: "Получить все задачи заказчика" })
  getAllCustomerTasks(
    @UserDecorator() user: any,
    @Query("state") state: CustomerTypeTaskEnum = CustomerTypeTaskEnum.All,
    @Query("page") page: number = 1,
    @Query("limit") limit: number = 100,
    @Query("search") search: number = 100
  ): Promise<Pagination<Task>> {
    return this.task.getAllCustomerTasks(user, state, page, limit, search);
  }

  @ApiBearerAuth()
  @hasRoles(Role.Customer)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post("start")
  @ApiBody({ type: StartTaskDto })
  @ApiOperation({ summary: "Выбрать исполнителя" })
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
  @ApiBody({ type: StartTaskDto })
  @ApiOperation({ summary: "Завершить проект" })
  finishTask(
    @Body() startTaskDto: StartTaskDto,
    @UserDecorator() user: any
  ): Promise<Task> {
    return this.task.finishTask(startTaskDto, user);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get(":id")
  @ApiOperation({ summary: "Получить задачу по id" })
  @ApiImplicitQuery({
    name: "id",
    required: true,
    type: Number
  })
  getOne(
    @Param("id") id: number,
    @UserDecorator() user: any
  ): Promise<any> {
    console.log(user)
    return this.task.findOne(id, user);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Удалить задачу" })
  deleteCustomer(
    @Param("id") id: number
  ): Promise<DeleteResult> {
    return this.task.deleteTask(id);
  }
}
