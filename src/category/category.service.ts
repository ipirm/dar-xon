import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DeleteResult, Repository, TreeRepository, UpdateResult } from "typeorm";
import { Category } from "../database/entities/category.entity";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { CreateTypeDto } from "./dto/create-type.dto";
import { TaskTypes } from "../database/entities/task-types.entity";
import { paginate, Pagination } from "nestjs-typeorm-paginate";

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category) private readonly category: TreeRepository<Category>,
    @InjectRepository(TaskTypes) private readonly taskType: Repository<TaskTypes>
  ) {
  }

  async getAll(): Promise<any> {
    return await this.category.findTrees();
  }

  async getChildren(parent: string): Promise<Category> {
    const cat = await this.category.findOne(parent);
    if (!cat)
      throw new HttpException({
        status: HttpStatus.CONFLICT,
        error: "Данная Категори не найдена"
      }, HttpStatus.CONFLICT);
    return await this.category.findDescendantsTree(cat);
  }

  async getParent(): Promise<Category[]> {
    return await this.category.findRoots();
  }

  async createCategory(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const cat = this.category.create({ name: createCategoryDto.name });
    if (createCategoryDto.parent) {
      const parent = await this.category.findOne(createCategoryDto.parent);
      Object.assign(cat, { parent: parent });
    }
    return await this.category.save(cat);
  }

  async findOne(id: number): Promise<Category> {
    return await this.category.findOne(id);
  }

  async updateCategory(id: number, createCategoryDto: CreateCategoryDto): Promise<UpdateResult> {
    const cat = this.category.create({ name: createCategoryDto.name });
    if (createCategoryDto.parent) {
      const parent = await this.category.findOne(createCategoryDto.parent);
      Object.assign(cat, { parent: parent });
      await this.category.save(cat);
    }
    return await this.category.update(id, cat);
  }

  async deleteCategory(id: number): Promise<DeleteResult> {
    return await this.category.delete(id);
  }

  async createType(createTypeDto: CreateTypeDto): Promise<TaskTypes> {
    return await this.taskType.save(this.taskType.create(createTypeDto));
  }

  async deleteType(id: number): Promise<DeleteResult> {
    return await this.taskType.delete(id);
  }

  async getAllTypes(page, limit, cat): Promise<Pagination<TaskTypes>> {
    const data = this.taskType.createQueryBuilder("c")
      .select(["c.id", "c.name"]);

    if (cat) {
      data.addSelect(["category.id"])
        .leftJoin("c.category", "category")
        .andWhere("category.id = :cat", { cat: cat });
    }

    return await paginate(data, { page, limit });
  }
}
