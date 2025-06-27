import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UtilsService } from 'src/commons/utils';
import { IUser } from 'src/commons/utils/utils.types';
import { MasterParams } from 'src/datasources/entities';

import { CreateParamsDto, DetailDto, ListParamsDto, UpdateParamsDto } from './params.dto';
import {
  CreateParamsResponse,
  DetailParamsResponse,
  ListParamsResponse,
  UpdateParamsResponse,
} from './params.types';

@Injectable()
export class ParamsService {
  constructor(
    private readonly utilsService: UtilsService,

    @InjectRepository(MasterParams)
    private readonly ParamsRepository: Repository<MasterParams>,
  ) {}

  /**
   * Handle get detail params service
   * @param dto
   * @returns
   */
  async getDetailParams(dto: DetailDto): Promise<DetailParamsResponse> {
    const getParams = await this.ParamsRepository.createQueryBuilder('params')
      .select([
        'params.id AS id',
        'params.name AS name',
        'params.desc AS desc',
        'params.value AS value',
        'params.status AS status',
      ])
      .where('params.id = :id', { id: dto.id })
      .getRawOne();

    if (!getParams) {
      throw new NotFoundException('Params not found');
    }

    return {
      id: getParams.id,
      name: getParams.name,
      desc: getParams.desc,
      value: getParams.value,
      status: getParams.status,
    };
  }

  /**
   * Handle get list params service
   * @param dto
   * @returns
   */
  async getListParams(dto: ListParamsDto): Promise<ListParamsResponse> {
    const pagination = this.utilsService.pagination(dto);
    const {
      page,
      limit,
      skip,
      status,
      orderBy = 'params.id',
      sort = 'DESC',
      search,
      startDate,
      endDate,
    } = pagination;

    const baseQuery = this.ParamsRepository.createQueryBuilder('params');

    if (search) {
      baseQuery.andWhere('params.name ILIKE :search', { search: `%${search}%` });
    }

    if (status !== undefined) {
      baseQuery.andWhere('params.status = :status', { status: status });
    }

    if (startDate && endDate) {
      baseQuery.andWhere('DATE(params.created_at) BETWEEN :start_date AND :end_date', {
        start_date: startDate,
        end_date: endDate,
      });
    }

    const countQuery = baseQuery.clone();

    baseQuery.select([
      'params.id AS id',
      'params.name AS name',
      'params.desc AS desc',
      'params.value AS value',
      'params.status AS status',
      `CASE
        WHEN params.status = 1 THEN 'Active'
        ELSE 'Inactive'
       END AS status_text`,
      'params.created_at AS created_at',
      'params.updated_at AS updated_at',
    ]);

    const [items, totalData] = await Promise.all([
      baseQuery.orderBy(orderBy, sort).limit(limit).offset(skip).getRawMany(),
      countQuery.getCount(),
    ]);

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
   * Handle create params service
   * @param dto
   * @param user
   * @returns
   */
  async createParams(dto: CreateParamsDto, user: IUser): Promise<CreateParamsResponse> {
    const getParams = await this.ParamsRepository.createQueryBuilder('params')
      .select(['params.id AS id'])
      .where('LOWER(params.name) = LOWER(:name)', { name: dto.name })
      .getRawOne();

    if (getParams) {
      throw new BadRequestException('Name already exists');
    }

    const formatDesc = this.utilsService.validateUpperCase(dto.desc);

    await this.ParamsRepository.insert({
      name: dto.name,
      desc: formatDesc,
      value: dto.value,
      created_by: user.id,
    });

    return {
      success: true,
      message: 'Successfully created',
    };
  }

  /**
   * Handle update params service
   * @param dto
   * @param user
   * @returns
   */
  async updateParams(dto: UpdateParamsDto, user: IUser): Promise<UpdateParamsResponse> {
    const getParams = await this.ParamsRepository.findOne({
      where: {
        id: dto.id,
      },
      select: ['id', 'name'],
    });

    if (!getParams) {
      throw new NotFoundException('Params not found');
    }

    if (getParams.name.toLowerCase() !== dto.name.toLowerCase()) {
      const checkParams = await this.ParamsRepository.createQueryBuilder('params')
        .select(['params.id AS id'])
        .where('LOWER(params.name) = LOWER(:name)', { name: dto.name })
        .getRawOne();

      if (checkParams) {
        throw new BadRequestException('Name already exists');
      }
    }

    const formatDesc = this.utilsService.validateUpperCase(dto.desc);

    await this.ParamsRepository.update(
      {
        id: dto.id,
      },
      {
        name: dto.name,
        desc: formatDesc,
        value: dto.value,
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
