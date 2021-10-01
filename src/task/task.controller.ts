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
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiTags } from "@nestjs/swagger";
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
import { ExecutorTypeEnum } from "../enums/executorType.enum";
import { StartTaskDto } from "./dto/start-task.dto";
import { DeleteResult } from "typeorm";


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
    console.log(createResponseDto);
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
  @ApiParam({ name: "state", enum: ExecutorTypeEnum })
  @ApiOperation({ summary: "Получить все задачи исполнителя" })
  getAllExecutorTasks(
    @UserDecorator() user: any,
    @Param("state") state: ExecutorTypeEnum = ExecutorTypeEnum.Execution,
    @Query("page") page: number = 1,
    @Query("limit") limit: number = 100
  ): Promise<TaskResponses> {
    return this.task.getAllExecutorTasks(user, state, page, limit);
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
  ): Promise<any> {
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
  ): Promise<any> {
    return this.task.finishTask(startTaskDto, user);
  }

  @Get(":id")
  @ApiOperation({ summary: "Получить задачу по id" })
  @ApiImplicitQuery({
    name: "id",
    required: true,
    type: Number
  })
  getOne(
    @Param("id") id: number
  ): Promise<Task> {
    return this.task.findOne(id);
  }

  // @Put(":id")
  // @ApiOperation({ summary: "Обновить раздел" })
  // @ApiBody({ type: CreateCategoryDto })
  // @ApiImplicitQuery({
  //   name: "id",
  //   required: true,
  //   type: Number
  // })
  // updateCustomer(
  //   @Param("id") id: number,
  //   @Body() createCategoryDto: CreateCategoryDto
  // ): Promise<UpdateResult> {
  //   return this.category.updateCategory(id, createCategoryDto);
  // }
  //
  //
  @Delete(":id")
  @ApiOperation({ summary: "Удалить задачу" })
  deleteCustomer(
    @Param("id") id: number
  ): Promise<DeleteResult> {
    return this.task.deleteTask(id);
  }
}
