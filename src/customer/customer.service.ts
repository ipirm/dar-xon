import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DeleteResult, Repository, UpdateResult } from "typeorm";
import { paginate, Pagination } from "nestjs-typeorm-paginate";
import { Customer } from "../database/entities/customer.entity";
import { CreateCustomerDto } from "./dto/create-customer.dto";

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(Customer) private readonly customer: Repository<Customer>
  ) {
  }

  async getAll(page, limit): Promise<Pagination<Customer>> {
    const data = await this.customer.createQueryBuilder("customer");
    return await paginate(data, { page, limit });
  }

  async saveCustomer(createCustomerDto: CreateCustomerDto, files): Promise<Customer> {
    console.log(files)
    return await this.customer.save(this.customer.create(createCustomerDto));
  }

  async getOne(id: number): Promise<Customer> {
    return await this.customer.findOne(id);
  }

  async updateCustomer(id: number, createCustomerDto: CreateCustomerDto): Promise<UpdateResult> {
    return await this.customer.update(id, { ...createCustomerDto });
  }

  async deleteCustomer(id: number): Promise<DeleteResult> {
    return await this.customer.delete(id);
  }
}