import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AppLoggerService } from 'src/commons/logger';
import { UtilsService } from 'src/commons/utils';
import { IUser, MutationResponse } from 'src/commons/utils/utils.types';
import { MasterBanner } from 'src/datasources/entities';
import { UploadWorkerService } from 'src/workers/upload';

import { CreateBannerDto, DetailDto, ListBannerDto, UpdateBannerDto } from './banner.dto';
import { DetailBannerResponse, GetBannerTypeResponse, ListBannerResponse } from './banner.types';

@Injectable()
export class BannerService {
  constructor(
    private readonly appLoggerService: AppLoggerService,
    private readonly utilsService: UtilsService,
    private readonly uploadWorkerService: UploadWorkerService,

    @InjectRepository(MasterBanner)
    private readonly BannerRepository: Repository<MasterBanner>,
  ) {}

  /**
   * Handle get detail banner service
   * @param dto
   * @returns
   */
  async getDetailBanner(dto: DetailDto): Promise<DetailBannerResponse> {
    const getBanner = await this.BannerRepository.createQueryBuilder('banner')
      .select([
        'banner.id AS id',
        'banner.title AS title',
        'banner.sub_title AS sub_title',
        'banner.image AS image',
        'banner.type AS type',
        'banner.placement_text_x AS placement_text_x',
        'banner.placement_text_y AS placement_text_y',
        'banner.sort AS sort',
        'banner.status AS status',
      ])
      .where('banner.id = :id', { id: dto.id })
      .getRawOne();

    if (!getBanner) {
      throw new NotFoundException('Banner not found');
    }

    return {
      id: getBanner.id,
      title: getBanner.title,
      sub_title: getBanner.sub_title,
      image: getBanner.image,
      type: getBanner.type,
      placement_text_x: getBanner.placement_text_x,
      placement_text_y: getBanner.placement_text_y,
      sort: getBanner.sort,
      status: getBanner.status,
    };
  }

  /**
   * Handle get banner type service
   * @returns
   */
  async getBannerType(): Promise<GetBannerTypeResponse[]> {
    return Promise.resolve([
      { id: 'Home', name: 'Home' },
      { id: 'Artists', name: 'Artists' },
      { id: 'Artworks', name: 'Artworks' },
      { id: 'Exhibitions', name: 'Exhibitions' },
      { id: 'Contact', name: 'Contact' },
      { id: 'Articles', name: 'Articles' },
      { id: 'Others', name: 'Others' },
    ]);
  }

  /**
   * Handle get list banner service
   * @param dto
   * @returns
   */
  async getListBanner(dto: ListBannerDto): Promise<ListBannerResponse> {
    const pagination = this.utilsService.pagination(dto);
    const {
      page,
      limit,
      skip,
      status,
      orderBy = 'banner.id',
      sort = 'DESC',
      search,
      startDate,
      endDate,
    } = pagination;

    const baseQuery = this.BannerRepository.createQueryBuilder('banner');

    if (search) {
      baseQuery.andWhere('banner.title ILIKE :search', { search: `%${search}%` });
    }

    if (status !== undefined) {
      baseQuery.andWhere('banner.status = :status', { status: status });
    }

    if (startDate && endDate) {
      baseQuery.andWhere('DATE(banner.created_at) BETWEEN :start_date AND :end_date', {
        start_date: startDate,
        end_date: endDate,
      });
    }

    const countQuery = baseQuery.clone();
    const itemsQuery = baseQuery
      .select([
        'banner.id AS id',
        'banner.title AS title',
        'banner.sub_title AS sub_title',
        'banner.type AS type',
        'banner.status AS status',
        `CASE
          WHEN banner.status = 1 THEN 'Active'
          ELSE 'Inactive'
         END AS status_text`,
        'banner.created_at AS created_at',
        'banner.updated_at AS updated_at',
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
   * Handle create banner service
   * @param dto
   * @param image
   * @param user
   * @returns
   */
  async createBanner(
    dto: CreateBannerDto,
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

    const formatTitle = this.utilsService.validateUpperCase(dto.title);
    const formatImage = this.utilsService.validateFile(image, {
      dest: '/banner',
      type: 'image',
    });

    await this.BannerRepository.insert({
      title: formatTitle,
      sub_title: dto.sub_title,
      image: formatImage.fullpath,
      type: dto.type,
      placement_text_x: dto.placement_text_x,
      placement_text_y: dto.placement_text_y,
      sort: dto.sort,
      created_by: user.id,
    });

    void this.uploadWorkerService.run({
      task: 'image.processing',
      data: {
        context: 'banner',
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
   * Handle update banner service
   * @param dto
   * @param image
   * @param user
   * @returns
   */
  async updateBanner(
    dto: UpdateBannerDto,
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

    const getBanner = await this.BannerRepository.findOne({
      where: {
        id: dto.id,
      },
      select: ['id', 'image'],
    });

    if (!getBanner) {
      throw new NotFoundException('Banner not found');
    }

    let filepath = '';
    let fullpath = '';

    if (dto.is_update_image) {
      if (!image) throw new BadRequestException('Image is required');

      const file = this.utilsService.validateFile(image, {
        dest: '/banner',
        type: 'image',
      });

      filepath = file.filepath;
      fullpath = file.fullpath;
    }

    const formatTitle = this.utilsService.validateUpperCase(dto.title);
    const formatImage = dto.is_update_image ? fullpath : getBanner.image;

    await this.BannerRepository.update(
      {
        id: dto.id,
      },
      {
        title: formatTitle,
        sub_title: dto.sub_title,
        image: formatImage,
        type: dto.type,
        placement_text_x: dto.placement_text_x,
        placement_text_y: dto.placement_text_y,
        sort: dto.sort,
        status: dto.status,
        updated_by: user.id,
      },
    );

    if (dto.is_update_image) {
      void this.uploadWorkerService.run({
        task: 'image.processing',
        data: {
          context: 'banner',
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
