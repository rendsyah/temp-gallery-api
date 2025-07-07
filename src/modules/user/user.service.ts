import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryRunner, Repository } from 'typeorm';

import { UtilsService } from 'src/commons/utils';
import { RunnerService } from 'src/datasources/runner';
import { IUser, MutationResponse } from 'src/commons/utils/utils.types';
import { User, UserAccess, UserAccessDetail } from 'src/datasources/entities';

import {
  CreateAccessDto,
  CreateUserDto,
  DetailDto,
  ListAccessDto,
  ListUserDto,
  UpdateAccessDto,
  UpdateUserDto,
} from './user.dto';
import {
  AccessOptionsResponse,
  DetailUserResponse,
  ListAccessResponse,
  ListUserResponse,
  UserResponse,
} from './user.types';

@Injectable()
export class UserService {
  constructor(
    private readonly utilsService: UtilsService,
    private readonly runnerService: RunnerService,

    @InjectRepository(User)
    private readonly UserRepository: Repository<User>,
    @InjectRepository(UserAccess)
    private readonly UserAccessRepository: Repository<UserAccess>,
  ) {}

  /**
   * Handle user service
   * @param user
   * @returns
   */
  async user(user: IUser): Promise<UserResponse> {
    const getUser = await this.UserRepository.createQueryBuilder('user')
      .innerJoin('user.user_access', 'access')
      .select([
        'user.id AS id',
        'user.fullname AS fullname',
        'access.name AS access_name',
        'user.email AS email',
        'user.phone AS phone',
        'user.image AS image',
      ])
      .where('user.id = :user', { user: user.id })
      .getRawOne();

    if (!getUser) {
      throw new NotFoundException('User not found');
    }

    return {
      id: getUser.id,
      fullname: getUser.fullname,
      access_name: getUser.access_name,
      email: getUser.email,
      phone: getUser.phone,
      image: getUser.image,
    };
  }

  /**
   * Handle get detail user
   * @param dto
   * @returns
   */
  async getDetailUser(dto: DetailDto): Promise<DetailUserResponse> {
    const getUser = await this.UserRepository.createQueryBuilder('user')
      .select([
        'user.id AS id',
        'user.access_id AS access_id',
        'user.username AS username',
        'user.fullname AS fullname',
        'user.email AS email',
        'user.phone AS phone',
        'user.image AS image',
        'user.status AS status',
      ])
      .where('user.id = :id', { id: dto.id })
      .getRawOne();

    if (!getUser) {
      throw new NotFoundException('User not found');
    }

    return {
      id: getUser.id,
      access_id: getUser.access_id,
      username: getUser.username,
      fullname: getUser.fullname,
      email: getUser.email,
      phone: getUser.phone,
      image: getUser.image,
      status: getUser.status,
    };
  }

  /**
   * Handle get list user service
   * @param dto
   * @returns
   */
  async getListUser(dto: ListUserDto): Promise<ListUserResponse> {
    const pagination = this.utilsService.pagination(dto);
    const {
      page,
      limit,
      skip,
      status,
      orderBy = 'user.id',
      sort = 'DESC',
      search,
      startDate,
      endDate,
    } = pagination;

    const baseQuery = this.UserRepository.createQueryBuilder('user').innerJoin(
      'user.user_access',
      'access',
    );

    if (search) {
      baseQuery.andWhere('user.fullname ILIKE :search', { search: `%${search}%` });
    }

    if (status !== undefined) {
      baseQuery.andWhere('user.status = :status', { status: status });
    }

    if (startDate && endDate) {
      baseQuery.andWhere('DATE(user.created_at) BETWEEN :start_date AND :end_date', {
        start_date: startDate,
        end_date: endDate,
      });
    }

    const countQuery = baseQuery.clone();
    const itemsQuery = baseQuery
      .select([
        'user.id AS id',
        'user.fullname AS fullname',
        'access.name AS access_name',
        'user.email AS email',
        'user.phone AS phone',
        'user.status AS status',
        `CASE
          WHEN user.status = 1 THEN 'Active'
          ELSE 'Inactive'
         END AS status_text`,
        'user.created_at AS created_at',
        'user.updated_at AS updated_at',
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
   * Handle create user service
   * @param dto
   * @param user
   * @returns
   */
  async createUser(dto: CreateUserDto, user: IUser): Promise<MutationResponse> {
    const getUser = await this.UserRepository.createQueryBuilder('user')
      .select(['user.id AS id'])
      .where('LOWER(user.username) = LOWER(:username)', { username: dto.username })
      .getRawOne();

    if (getUser) {
      throw new BadRequestException('Username already exists');
    }

    const formatFullname = this.utilsService.validateUpperCase(dto.fullname);
    const formatPhone = this.utilsService.validateReplacePhone(dto.phone, '08');
    const formatPassword = await this.utilsService.validateHash(dto.password);

    await this.UserRepository.insert({
      access_id: dto.access_id,
      username: dto.username,
      password: formatPassword,
      fullname: formatFullname,
      email: dto.email,
      phone: formatPhone,
      created_by: user.id,
    });

    return {
      success: true,
      message: 'Successfully created',
    };
  }

  /**
   * Handle update user service
   * @param dto
   * @param user
   * @returns
   */
  async updateUser(dto: UpdateUserDto, user: IUser): Promise<MutationResponse> {
    const getUser = await this.UserRepository.findOne({
      where: {
        id: dto.id,
      },
      select: ['id'],
    });

    if (!getUser) {
      throw new NotFoundException('User not found');
    }

    const formatFullname = this.utilsService.validateUpperCase(dto.fullname);
    const formatPhone = this.utilsService.validateReplacePhone(dto.phone, '08');

    await this.UserRepository.update(
      {
        id: dto.id,
      },
      {
        access_id: dto.access_id,
        fullname: formatFullname,
        email: dto.email,
        phone: formatPhone,
        status: dto.status,
        updated_by: user.id,
      },
    );

    return {
      success: true,
      message: 'Successfully updated',
    };
  }

  /**
   * Handle get list access service
   * @param dto
   * @returns
   */
  async getListAccess(dto: ListAccessDto): Promise<ListAccessResponse> {
    const pagination = this.utilsService.pagination(dto);
    const {
      page,
      limit,
      skip,
      status,
      orderBy = 'access.id',
      sort = 'DESC',
      search,
      startDate,
      endDate,
    } = pagination;

    const baseQuery = this.UserAccessRepository.createQueryBuilder('access');

    if (search) {
      baseQuery.andWhere('access.name ILIKE :search', { search: `%${search}%` });
    }

    if (status !== undefined) {
      baseQuery.andWhere('access.status = :status', { status: status });
    }

    if (startDate && endDate) {
      baseQuery.andWhere('DATE(access.created_at) BETWEEN :start_date AND :end_date', {
        start_date: startDate,
        end_date: endDate,
      });
    }

    const countQuery = baseQuery.clone();
    const itemsQuery = baseQuery
      .select([
        'access.id AS id',
        'access.name AS name',
        'access.description AS description',
        'access.status AS status',
        `CASE
          WHEN access.status = 1 THEN 'Active'
          ELSE 'Inactive'
         END AS status_text`,
        'access.created_at AS created_at',
        'access.updated_at AS updated_at',
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
   * Handle get access options service
   * @returns
   */
  async getAccessOptions(): Promise<AccessOptionsResponse[]> {
    const getAccess = await this.UserAccessRepository.createQueryBuilder('access')
      .select(['access.id AS id', 'access.name AS name'])
      .where('access.status = :status', { status: 1 })
      .andWhere('access.is_show = :is_show', { is_show: 1 })
      .getRawMany();

    return getAccess as AccessOptionsResponse[];
  }

  /**
   * Handle create access service
   * @param dto
   * @param user
   * @returns
   */
  async createAccess(dto: CreateAccessDto, user: IUser): Promise<MutationResponse> {
    const checkAccess = await this.UserAccessRepository.createQueryBuilder('access')
      .select(['access.id AS id'])
      .where('LOWER(access.name) = LOWER(:name)', { name: dto.name })
      .getRawOne();

    if (checkAccess) {
      throw new BadRequestException('Name already exists');
    }

    const formatName = this.utilsService.validateUpperCase(dto.name);
    const formatDescription = this.utilsService.validateUpperCase(dto.description);

    await this.runnerService.runTransaction(async (queryRunner: QueryRunner) => {
      const accessResult = await queryRunner.manager.insert(UserAccess, {
        name: formatName,
        description: formatDescription,
        created_by: user.id,
      });

      const insertAccessDetail = dto.access_detail.map((item) => {
        return {
          access_id: +accessResult.generatedMaps[0].id,
          menu_id: item.menu_id,
          m_created: item.m_created,
          m_updated: item.m_updated,
          m_deleted: item.m_deleted,
          created_by: user.id,
        };
      });

      await queryRunner.manager
        .createQueryBuilder(UserAccessDetail, 'access_det')
        .insert()
        .into(UserAccessDetail)
        .values(insertAccessDetail)
        .execute();
    });

    return {
      success: true,
      message: 'Successfully created',
    };
  }

  /**
   * Handle update access service
   * @param dto
   * @param user
   * @returns
   */
  async updateAccess(dto: UpdateAccessDto, user: IUser): Promise<MutationResponse> {
    const getAccess = await this.UserAccessRepository.findOne({
      where: {
        id: dto.id,
      },
      select: ['id', 'name', 'created_by'],
    });

    if (!getAccess) {
      throw new NotFoundException('Access not found');
    }

    if (getAccess.name.toLowerCase() !== dto.name.toLowerCase()) {
      const checkAccess = await this.UserAccessRepository.createQueryBuilder('access')
        .select(['access.id AS id'])
        .where('LOWER(access.name) = LOWER(:name)', { name: dto.name })
        .getRawOne();

      if (checkAccess) {
        throw new BadRequestException('Name already exists');
      }
    }

    const formatName = this.utilsService.validateUpperCase(dto.name);
    const formatDescription = this.utilsService.validateUpperCase(dto.description);

    await this.runnerService.runTransaction(async (queryRunner: QueryRunner) => {
      await queryRunner.manager.update(
        UserAccess,
        { id: dto.id },
        {
          name: formatName,
          description: formatDescription,
          status: dto.status,
          updated_by: user.id,
        },
      );

      await queryRunner.manager.delete(UserAccessDetail, {
        access_id: dto.id,
      });

      const insertAccessDetail = dto.access_detail.map((item) => {
        return {
          access_id: dto.id,
          menu_id: item.menu_id,
          m_created: item.m_created,
          m_updated: item.m_updated,
          m_deleted: item.m_deleted,
          created_by: getAccess.created_by,
          updated_by: user.id,
        };
      });

      await queryRunner.manager
        .createQueryBuilder(UserAccessDetail, 'access_det')
        .insert()
        .into(UserAccessDetail)
        .values(insertAccessDetail)
        .execute();
    });

    return {
      success: true,
      message: 'Successfully updated',
    };
  }
}
