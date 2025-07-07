import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UtilsService } from 'src/commons/utils';
import { IUser, MutationResponse } from 'src/commons/utils/utils.types';
import { ProductCategory } from 'src/datasources/entities';

import { CreateCategoryDto, DetailDto, ListCategoryDto, UpdateCategoryDto } from './category.dto';
import {
  CategoryOptionsResponse,
  DetailCategoryResponse,
  ListCategoryResponse,
} from './category.types';

@Injectable()
export class CategoryService {
  constructor(
    private readonly utilsService: UtilsService,

    @InjectRepository(ProductCategory)
    private readonly CategoryRepository: Repository<ProductCategory>,
  ) {}

  /**
   * Handle get detail category service
   * @param dto
   * @returns
   */
  async getDetailCategory(dto: DetailDto): Promise<DetailCategoryResponse> {
    const getCategory = await this.CategoryRepository.createQueryBuilder('category')
      .select([
        'category.id AS id',
        'category.name AS name',
        'category.desc AS desc',
        'category.status AS status',
      ])
      .where('category.id = :id', { id: dto.id })
      .getRawOne();

    if (!getCategory) {
      throw new NotFoundException('Category not found');
    }

    return {
      id: getCategory.id,
      name: getCategory.name,
      desc: getCategory.desc,
      status: getCategory.status,
    };
  }

  /**
   * Handle get category options service
   * @returns
   */
  async getCategoryOptions(): Promise<CategoryOptionsResponse[]> {
    const getCategory = await this.CategoryRepository.createQueryBuilder('category')
      .select(['category.id AS id', 'category.name AS name'])
      .where('category.status = :status', { status: 1 })
      .getRawMany();

    return getCategory as CategoryOptionsResponse[];
  }

  /**
   * Handle get list category service
   * @param dto
   * @returns
   */
  async getListCategory(dto: ListCategoryDto): Promise<ListCategoryResponse> {
    const pagination = this.utilsService.pagination(dto);
    const {
      page,
      limit,
      skip,
      status,
      orderBy = 'category.id',
      sort = 'DESC',
      search,
      startDate,
      endDate,
    } = pagination;

    const baseQuery = this.CategoryRepository.createQueryBuilder('category');

    if (search) {
      baseQuery.andWhere('category.name ILIKE :search', { search: `%${search}%` });
    }

    if (status !== undefined) {
      baseQuery.andWhere('category.status = :status', { status: status });
    }

    if (startDate && endDate) {
      baseQuery.andWhere('DATE(category.created_at) BETWEEN :start_date AND :end_date', {
        start_date: startDate,
        end_date: endDate,
      });
    }

    const countQuery = baseQuery.clone();
    const itemsQuery = baseQuery
      .select([
        'category.id AS id',
        'category.name AS name',
        'category.desc AS desc',
        'category.status AS status',
        `CASE
          WHEN category.status = 1 THEN 'Active'
          ELSE 'Inactive'
         END AS status_text`,
        'category.created_at AS created_at',
        'category.updated_at AS updated_at',
      ])
      .orderBy(orderBy, sort)
      .limit(limit)
      .offset(skip)
      .getRawMany();

    const [items, totalData] = await Promise.all([itemsQuery, countQuery.getCount()]);

    return this.utilsService.paginationResponse({
      items,
      meta: {
        page,
        limit,
        totalData,
      },
    });
  }

  /**
   * Handle create category service
   * @param dto
   * @param user
   * @returns
   */
  async createCategory(dto: CreateCategoryDto, user: IUser): Promise<MutationResponse> {
    const getCategory = await this.CategoryRepository.createQueryBuilder('category')
      .select(['category.id AS id'])
      .where('LOWER(category.name) = LOWER(:name)', { name: dto.name })
      .getRawOne();

    if (getCategory) {
      throw new BadRequestException('Name already exists');
    }

    const formatName = this.utilsService.validateUpperCase(dto.name);
    const formatDesc = this.utilsService.validateUpperCase(dto.desc);

    await this.CategoryRepository.insert({
      name: formatName,
      desc: formatDesc,
      created_by: user.id,
    });

    return {
      success: true,
      message: 'Successfully created',
    };
  }

  /**
   * Handle update category service
   * @param dto
   * @param user
   * @returns
   */
  async updateCategory(dto: UpdateCategoryDto, user: IUser): Promise<MutationResponse> {
    const getCategory = await this.CategoryRepository.findOne({
      where: {
        id: dto.id,
      },
      select: ['id', 'name'],
    });

    if (!getCategory) {
      throw new NotFoundException('Category not found');
    }

    if (getCategory.name.toLowerCase() !== dto.name.toLowerCase()) {
      const checkCategory = await this.CategoryRepository.createQueryBuilder('category')
        .select(['category.id AS id'])
        .where('LOWER(category.name) = LOWER(:name)', { name: dto.name })
        .getRawOne();

      if (checkCategory) {
        throw new BadRequestException('Name already exists');
      }
    }

    const formatName = this.utilsService.validateUpperCase(dto.name);
    const formatDesc = this.utilsService.validateUpperCase(dto.desc);

    await this.CategoryRepository.update(
      {
        id: dto.id,
      },
      {
        name: formatName,
        desc: formatDesc,
        status: dto.status,
        updated_by: user.id,
      },
    );

    return {
      success: true,
      message: 'Successfully updated',
    };
  }
}
