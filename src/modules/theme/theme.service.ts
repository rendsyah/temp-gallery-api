import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UtilsService } from 'src/commons/utils';
import { IUser, MutationResponse } from 'src/commons/utils/utils.types';
import { ProductThemes } from 'src/datasources/entities';

import { CreateThemeDto, DetailDto, ListThemeDto, UpdateThemeDto } from './theme.dto';
import { DetailThemeResponse, ListThemeResponse, ThemeOptionsResponse } from './theme.types';

@Injectable()
export class ThemeService {
  constructor(
    private readonly utilsService: UtilsService,

    @InjectRepository(ProductThemes)
    private readonly ThemeRepository: Repository<ProductThemes>,
  ) {}

  /**
   * Handle get detail theme service
   * @param dto
   * @returns
   */
  async getDetailTheme(dto: DetailDto): Promise<DetailThemeResponse> {
    const getTheme = await this.ThemeRepository.createQueryBuilder('theme')
      .select([
        'theme.id AS id',
        'theme.name AS name',
        'theme.desc AS desc',
        'theme.status AS status',
      ])
      .where('theme.id = :id', { id: dto.id })
      .getRawOne();

    if (!getTheme) {
      throw new NotFoundException('Theme not found');
    }

    return {
      id: getTheme.id,
      name: getTheme.name,
      desc: getTheme.desc,
      status: getTheme.status,
    };
  }

  /**
   * Handle get theme options service
   * @returns
   */
  async getThemeOptions(): Promise<ThemeOptionsResponse[]> {
    const getTheme = await this.ThemeRepository.createQueryBuilder('theme')
      .select(['theme.id AS id', 'theme.name AS name'])
      .where('theme.status = :status', { status: 1 })
      .getRawMany();

    return getTheme as ThemeOptionsResponse[];
  }

  /**
   * Handle get list theme service
   * @param dto
   * @returns
   */
  async getListTheme(dto: ListThemeDto): Promise<ListThemeResponse> {
    const pagination = this.utilsService.pagination(dto);
    const {
      page,
      limit,
      skip,
      status,
      orderBy = 'theme.id',
      sort = 'DESC',
      search,
      startDate,
      endDate,
    } = pagination;

    const baseQuery = this.ThemeRepository.createQueryBuilder('theme');

    if (search) {
      baseQuery.andWhere('theme.name ILIKE :search', { search: `%${search}%` });
    }

    if (status !== undefined) {
      baseQuery.andWhere('theme.status = :status', { status: status });
    }

    if (startDate && endDate) {
      baseQuery.andWhere('DATE(theme.created_at) BETWEEN :start_date AND :end_date', {
        start_date: startDate,
        end_date: endDate,
      });
    }

    const countQuery = baseQuery.clone();
    const itemsQuery = baseQuery
      .select([
        'theme.id AS id',
        'theme.name AS name',
        'theme.desc AS desc',
        'theme.status AS status',
        `CASE
          WHEN theme.status = 1 THEN 'Active'
          ELSE 'Inactive'
         END AS status_text`,
        'theme.created_at AS created_at',
        'theme.updated_at AS updated_at',
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
   * Handle create theme service
   * @param dto
   * @param user
   * @returns
   */
  async createTheme(dto: CreateThemeDto, user: IUser): Promise<MutationResponse> {
    const getTheme = await this.ThemeRepository.createQueryBuilder('theme')
      .select(['theme.id AS id'])
      .where('LOWER(theme.name) = LOWER(:name)', { name: dto.name })
      .getRawOne();

    if (getTheme) {
      throw new BadRequestException('Name already exists');
    }

    const formatName = this.utilsService.validateUpperCase(dto.name);
    const formatDesc = this.utilsService.validateUpperCase(dto.desc);

    await this.ThemeRepository.insert({
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
   * Handle update theme service
   * @param dto
   * @param user
   * @returns
   */
  async updateTheme(dto: UpdateThemeDto, user: IUser): Promise<MutationResponse> {
    const getTheme = await this.ThemeRepository.findOne({
      where: {
        id: dto.id,
      },
      select: ['id', 'name'],
    });

    if (!getTheme) {
      throw new NotFoundException('Theme not found');
    }

    if (getTheme.name.toLowerCase() !== dto.name.toLowerCase()) {
      const checkTheme = await this.ThemeRepository.createQueryBuilder('theme')
        .select(['theme.id AS id'])
        .where('LOWER(theme.name) = LOWER(:name)', { name: dto.name })
        .getRawOne();

      if (checkTheme) {
        throw new BadRequestException('Name already exists');
      }
    }

    const formatName = this.utilsService.validateUpperCase(dto.name);
    const formatDesc = this.utilsService.validateUpperCase(dto.desc);

    await this.ThemeRepository.update(
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
