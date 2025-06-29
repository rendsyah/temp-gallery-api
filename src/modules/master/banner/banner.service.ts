import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UtilsService } from 'src/commons/utils';
import { IUser, MutationResponse } from 'src/commons/utils/utils.types';
import { MasterBanner } from 'src/datasources/entities';

import { CreateBannerDto, DetailDto, ListBannerDto, UpdateBannerDto } from './banner.dto';
import { DetailBannerResponse, GetBannerTypeResponse, ListBannerResponse } from './banner.types';

@Injectable()
export class BannerService {
  constructor(
    private readonly utilsService: UtilsService,

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
      { id: 'Artist', name: 'Artist' },
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

    baseQuery.select([
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
   * Handle create banner service
   * @param dto
   * @param user
   * @returns
   */
  async createBanner(dto: CreateBannerDto, user: IUser): Promise<MutationResponse> {
    const formatTitle = this.utilsService.validateUpperCase(dto.title);
    const formatImage = this.utilsService.validateBase64File(dto.image, {
      dest: '/banner',
      type: 'image',
      mimes: ['image/jpeg', 'image/png'],
      maxSize: 5,
    });

    await this.BannerRepository.insert({
      title: formatTitle,
      sub_title: dto.sub_title,
      image: formatImage,
      type: dto.type,
      placement_text_x: dto.placement_text_x,
      placement_text_y: dto.placement_text_y,
      sort: dto.sort,
      created_by: user.id,
    });

    return {
      success: true,
      message: 'Successfully created',
    };
  }

  /**
   * Handle update banner service
   * @param dto
   * @param user
   * @returns
   */
  async updateBanner(dto: UpdateBannerDto, user: IUser): Promise<MutationResponse> {
    const getBanner = await this.BannerRepository.findOne({
      where: {
        id: dto.id,
      },
      select: ['id'],
    });

    if (!getBanner) {
      throw new NotFoundException('Banner not found');
    }

    const formatTitle = this.utilsService.validateUpperCase(dto.title);
    const formatImage = dto.is_update_image
      ? this.utilsService.validateBase64File(dto.image, {
          dest: '/banner',
          type: 'image',
          mimes: ['image/jpeg', 'image/png'],
          maxSize: 5,
        })
      : dto.image;

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

    return {
      success: true,
      message: 'Successfully updated',
    };
  }
}
