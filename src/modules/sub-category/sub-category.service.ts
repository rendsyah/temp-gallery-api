import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UtilsService } from 'src/commons/utils';
import { IUser, MutationResponse } from 'src/commons/utils/utils.types';
import { ProductSubCategory } from 'src/datasources/entities';

import {
  CreateSubCategoryDto,
  DetailDto,
  ListSubCategoryDto,
  OptionsSubCategoryDto,
  UpdateSubCategoryDto,
} from './sub-category.dto';
import {
  DetailSubCategoryResponse,
  ListSubCategoryResponse,
  OptionsSubCategoryResponse,
} from './sub-category.types';

@Injectable()
export class SubCategoryService {
  constructor(
    private readonly utilsService: UtilsService,

    @InjectRepository(ProductSubCategory)
    private readonly SubCategoryRepository: Repository<ProductSubCategory>,
  ) {}

  /**
   * Handle get detail sub category service
   * @param dto
   * @returns
   */
  async getDetailSubCategory(dto: DetailDto): Promise<DetailSubCategoryResponse> {
    const getSubCategory = await this.SubCategoryRepository.createQueryBuilder('sub_category')
      .select([
        'sub_category.id AS id',
        'sub_category.category_id AS category_id',
        'sub_category.name AS name',
        'sub_category.desc AS desc',
        'sub_category.status AS status',
      ])
      .where('sub_category.id = :id', { id: dto.id })
      .getRawOne();

    if (!getSubCategory) {
      throw new NotFoundException('Sub Category not found');
    }

    return {
      id: getSubCategory.id,
      category_id: getSubCategory.category_id,
      name: getSubCategory.name,
      desc: getSubCategory.desc,
      status: getSubCategory.status,
    };
  }

  /**
   * Handle get options sub category service
   * @param dto
   * @returns
   */
  async getOptionsSubCategory(dto: OptionsSubCategoryDto): Promise<OptionsSubCategoryResponse[]> {
    const getSubCategory = await this.SubCategoryRepository.createQueryBuilder('sub_category')
      .select(['sub_category.id AS id', 'sub_category.name AS name'])
      .where('sub_category.category_id = :category_id', { category_id: dto.category_id })
      .andWhere('sub_category.status = :status', { status: 1 })
      .getRawMany();

    return getSubCategory as OptionsSubCategoryResponse[];
  }

  /**
   * Handle get list sub category service
   * @param dto
   * @returns
   */
  async getListSubCategory(dto: ListSubCategoryDto): Promise<ListSubCategoryResponse> {
    const pagination = this.utilsService.pagination(dto);
    const {
      page,
      limit,
      skip,
      status,
      orderBy = 'sub_category.id',
      sort = 'DESC',
      search,
      startDate,
      endDate,
    } = pagination;

    const baseQuery = this.SubCategoryRepository.createQueryBuilder('sub_category').innerJoin(
      'sub_category.category',
      'category',
    );

    if (search) {
      baseQuery.andWhere('sub_category.name ILIKE :search', { search: `%${search}%` });
    }

    if (status !== undefined) {
      baseQuery.andWhere('sub_category.status = :status', { status: status });
    }

    if (startDate && endDate) {
      baseQuery.andWhere('DATE(sub_category.created_at) BETWEEN :start_date AND :end_date', {
        start_date: startDate,
        end_date: endDate,
      });
    }

    const countQuery = baseQuery.clone();
    const itemsQuery = baseQuery
      .select([
        'sub_category.id AS id',
        'category.name AS category_name',
        'sub_category.name AS name',
        'sub_category.desc AS desc',
        'sub_category.status AS status',
        `CASE
          WHEN sub_category.status = 1 THEN 'Active'
          ELSE 'Inactive'
         END AS status_text`,
        'sub_category.created_at AS created_at',
        'sub_category.updated_at AS updated_at',
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
   * Handle create sub category service
   * @param dto
   * @param user
   * @returns
   */
  async createSubCategory(dto: CreateSubCategoryDto, user: IUser): Promise<MutationResponse> {
    const getSubCategory = await this.SubCategoryRepository.createQueryBuilder('sub_category')
      .select(['sub_category.id AS id'])
      .where('LOWER(sub_category.name) = LOWER(:name)', { name: dto.name })
      .getRawOne();

    if (getSubCategory) {
      throw new BadRequestException('Name already exists');
    }

    const formatName = this.utilsService.validateUpperCase(dto.name);
    const formatDesc = this.utilsService.validateUpperCase(dto.desc);

    await this.SubCategoryRepository.insert({
      category_id: dto.category_id,
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
   * Handle update sub category service
   * @param dto
   * @param user
   * @returns
   */
  async updateSubCategory(dto: UpdateSubCategoryDto, user: IUser): Promise<MutationResponse> {
    const getSubCategory = await this.SubCategoryRepository.findOne({
      where: {
        id: dto.id,
      },
      select: ['id', 'name'],
    });

    if (!getSubCategory) {
      throw new NotFoundException('Sub Category not found');
    }

    if (getSubCategory.name.toLowerCase() !== dto.name.toLowerCase()) {
      const checkCategory = await this.SubCategoryRepository.createQueryBuilder('sub_category')
        .select(['sub_category.id AS id'])
        .where('LOWER(sub_category.name) = LOWER(:name)', { name: dto.name })
        .getRawOne();

      if (checkCategory) {
        throw new BadRequestException('Name already exists');
      }
    }

    const formatName = this.utilsService.validateUpperCase(dto.name);
    const formatDesc = this.utilsService.validateUpperCase(dto.desc);

    await this.SubCategoryRepository.update(
      {
        id: dto.id,
      },
      {
        category_id: dto.category_id,
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
