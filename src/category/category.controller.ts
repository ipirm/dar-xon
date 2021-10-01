import { Body, Controller, Delete, Get, Param, Post, Put, Query } from "@nestjs/common";
import { ApiBody, ApiOperation, ApiTags } from "@nestjs/swagger";
import { CategoryService } from "./category.service";
import { ApiImplicitQuery } from "@nestjs/swagger/dist/decorators/api-implicit-query.decorator";
import { Pagination } from "nestjs-typeorm-paginate";
import { DeleteResult, UpdateResult } from "typeorm";
import { Category } from "../database/entities/category.entity";
import { CreateCategoryDto } from "./dto/create-category.dto";


@ApiTags("Category")
@Controller("category")
export class CategoryController {
  constructor(private readonly category: CategoryService) {
  }

  @Get("")
  @ApiOperation({ summary: "Получить все разделы" })
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
  ): Promise<Pagination<Category>> {
    return this.category.getAll(page, limit);
  }

  @Post("")
  @ApiOperation({ summary: "Создать раздел" })
  @ApiBody({ type: CreateCategoryDto })
  saveCustomer(
    @Body() createCategoryDto: CreateCategoryDto
  ): Promise<Category> {
    return this.category.createCategory(createCategoryDto);
  }

  @Get(":id")
  @ApiOperation({ summary: "Получить раздел по id" })
  @ApiImplicitQuery({
    name: "id",
    required: true,
    type: Number
  })
  getOne(
    @Param("id") id: number
  ): Promise<Category> {
    return this.category.findOne(id);
  }

  @Put(":id")
  @ApiOperation({ summary: "Обновить раздел" })
  @ApiBody({ type: CreateCategoryDto })
  @ApiImplicitQuery({
    name: "id",
    required: true,
    type: Number
  })
  updateCustomer(
    @Param("id") id: number,
    @Body() createCategoryDto: CreateCategoryDto
  ): Promise<UpdateResult> {
    return this.category.updateCategory(id, createCategoryDto);
  }


  @Delete(":id")
  @ApiOperation({ summary: "Удалить раздел" })
  deleteCustomer(
    @Param("id") id: number
  ): Promise<DeleteResult> {
    return this.category.deleteCategory(id);
  }

  @Get("children/parent")
  @ApiOperation({ summary: "Получить саб разделы" })
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
  getChildren(
    @Query("page") page: number = 1,
    @Query("limit") limit: number = 100,
    @Query("parent") parent: string = null
  ): Promise<Pagination<Category>> {
    return this.category.getChildren(parent, page, limit);
  }

}
