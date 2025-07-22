import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AppLoggerService } from 'src/commons/logger';
import { UtilsService } from 'src/commons/utils';
import { IUser, MutationResponse } from 'src/commons/utils/utils.types';
import { MasterExhibitions } from 'src/datasources/entities';
import { UploadWorkerService } from 'src/workers/upload';

import {
  CreateExhibitionDto,
  DetailDto,
  ListExhibitionDto,
  UpdateExhibitionDto,
} from './exhibitions.dto';
import { DetailExhibitionResponse, ListExhibitionResponse } from './exhibitions.types';

@Injectable()
export class ExhibitionsService {
  constructor(
    private readonly appLoggerService: AppLoggerService,
    private readonly utilsService: UtilsService,
    private readonly uploadWorkerService: UploadWorkerService,

    @InjectRepository(MasterExhibitions)
    private readonly ExhibitionRepository: Repository<MasterExhibitions>,
  ) {}

  /**
   * Handle get detail exhibition service
   * @param dto
   * @returns
   */
  async getDetailExhibition(dto: DetailDto): Promise<DetailExhibitionResponse> {
    const getExhibition = await this.ExhibitionRepository.createQueryBuilder('exhibitions')
      .select([
        'exhibitions.id AS id',
        'exhibitions.artist_id AS artist_id',
        'exhibitions.name AS name',
        'exhibitions.image AS image',
        'exhibitions.desc AS desc',
        'exhibitions.start_date AS start_date',
        'exhibitions.end_date AS end_date',
        'exhibitions.status AS status',
      ])
      .where('exhibitions.id = :id', { id: dto.id })
      .getRawOne();

    if (!getExhibition) {
      throw new NotFoundException('Exhibition not found');
    }

    return {
      id: getExhibition.id,
      artist_id: getExhibition.artist_id,
      name: getExhibition.name,
      image: getExhibition.image,
      desc: getExhibition.desc,
      start_date: getExhibition.start_date,
      end_date: getExhibition.end_date,
      status: getExhibition.status,
    };
  }

  /**
   * Handle get list exhibition service
   * @param dto
   * @returns
   */
  async getListExhibition(dto: ListExhibitionDto): Promise<ListExhibitionResponse> {
    const pagination = this.utilsService.pagination(dto);
    const {
      page,
      limit,
      skip,
      status,
      orderBy = 'exhibitions.id',
      sort = 'DESC',
      search,
      startDate,
      endDate,
    } = pagination;

    const baseQuery = this.ExhibitionRepository.createQueryBuilder('exhibitions').innerJoin(
      'exhibitions.artist',
      'artist',
    );

    if (search) {
      baseQuery.andWhere('exhibitions.name ILIKE :search', { search: `%${search}%` });
    }

    if (status !== undefined) {
      baseQuery.andWhere('exhibitions.status = :status', { status: status });
    }

    if (startDate && endDate) {
      baseQuery.andWhere('DATE(exhibitions.start_date) BETWEEN :start_date AND :end_date', {
        start_date: startDate,
        end_date: endDate,
      });
    }

    const countQuery = baseQuery.clone();
    const itemsQuery = baseQuery
      .select([
        'exhibitions.id AS id',
        'artist.name AS artist_name',
        'exhibitions.name AS name',
        'exhibitions.desc AS desc',
        'exhibitions.start_date AS start_date',
        'exhibitions.end_date AS end_date',
        'exhibitions.status AS status',
        `CASE
            WHEN exhibitions.status = 1 THEN 'Active'
            ELSE 'Inactive'
         END AS status_text`,
        'exhibitions.created_at AS created_at',
        'exhibitions.updated_at AS updated_at',
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
   * Handle create exhibition service
   * @param dto
   * @param image
   * @param user
   * @returns
   */
  async createExhibition(
    dto: CreateExhibitionDto,
    image: Express.Multer.File,
    user: IUser,
  ): Promise<MutationResponse> {
    this.appLoggerService.addMeta('multipart/form-data', {
      ...dto,
      image: {
        fieldname: image.fieldname,
        original_name: image.originalname,
        mimetype: image.mimetype,
        size: image.size,
      },
    });

    const getExhibition = await this.ExhibitionRepository.createQueryBuilder('exhibitions')
      .select(['exhibitions.id AS id'])
      .where('LOWER(exhibitions.name) = LOWER(:name)', { name: dto.name })
      .getRawOne();

    if (getExhibition) {
      throw new BadRequestException('Name already exists');
    }

    const formatName = this.utilsService.validateUpperCase(dto.name);
    const formatSlug = this.utilsService.validateSlug(dto.name);
    const formatImage = this.utilsService.validateFile(image, {
      dest: '/exhibitions',
      type: 'image',
    });

    await this.ExhibitionRepository.insert({
      artist_id: dto.artist_id,
      name: formatName,
      slug: formatSlug,
      image: formatImage.fullpath,
      desc: dto.desc,
      start_date: dto.start_date,
      end_date: dto.end_date,
      created_by: user.id,
    });

    void this.uploadWorkerService.run({
      task: 'image.processing',
      data: {
        context: 'exhibitions',
        buffer: image.buffer,
        original_name: image.originalname,
        filename: formatImage.fullpath,
        dest: formatImage.filepath,
      },
    });

    return {
      success: true,
      message: 'Successfully created',
    };
  }

  /**
   * Handle update exhibition service
   * @param dto
   * @param image
   * @param user
   * @returns
   */
  async updateExhibition(
    dto: UpdateExhibitionDto,
    image: Express.Multer.File,
    user: IUser,
  ): Promise<MutationResponse> {
    this.appLoggerService.addMeta('multipart/form-data', {
      ...dto,
      image: dto.is_update_image
        ? {
            fieldname: image.fieldname,
            original_name: image.originalname,
            mimetype: image.mimetype,
            size: image.size,
          }
        : null,
    });

    const getExhibition = await this.ExhibitionRepository.findOne({
      where: {
        id: dto.id,
      },
      select: ['id', 'name', 'image'],
    });

    if (!getExhibition) {
      throw new NotFoundException('Exhibition not found');
    }

    if (getExhibition.name.toLowerCase() !== dto.name.toLowerCase()) {
      const checkExhibition = await this.ExhibitionRepository.createQueryBuilder('exhibitions')
        .select(['exhibitions.id AS id'])
        .where('LOWER(exhibitions.name) = LOWER(:name)', { name: dto.name })
        .getRawOne();

      if (checkExhibition) {
        throw new BadRequestException('Name already exists');
      }
    }

    let filepath = '';
    let fullpath = '';

    if (dto.is_update_image) {
      if (!image) throw new BadRequestException('Image is required');

      const file = this.utilsService.validateFile(image, {
        dest: '/exhibitions',
        type: 'image',
      });

      filepath = file.filepath;
      fullpath = file.fullpath;
    }

    const formatName = this.utilsService.validateUpperCase(dto.name);
    const formatSlug = this.utilsService.validateSlug(dto.name);
    const formatImage = dto.is_update_image ? fullpath : getExhibition.image;

    await this.ExhibitionRepository.update(
      {
        id: dto.id,
      },
      {
        artist_id: dto.artist_id,
        name: formatName,
        slug: formatSlug,
        image: formatImage,
        desc: dto.desc,
        start_date: dto.start_date,
        end_date: dto.end_date,
        status: dto.status,
        updated_by: user.id,
      },
    );

    if (dto.is_update_image) {
      void this.uploadWorkerService.run({
        task: 'image.processing',
        data: {
          context: 'exhibitions',
          buffer: image.buffer,
          original_name: image.originalname,
          filename: fullpath,
          dest: filepath,
        },
      });
    }

    return {
      success: true,
      message: 'Successfully updated',
    };
  }
}
