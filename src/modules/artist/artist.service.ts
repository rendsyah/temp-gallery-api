import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';

import { AppLoggerService } from 'src/commons/logger';
import { UtilsService } from 'src/commons/utils';
import { IUser, MutationResponse } from 'src/commons/utils/utils.types';
import { ProductArtists } from 'src/datasources/entities';
import { UploadWorkerService } from 'src/workers/upload';

import { CreateArtistDto, DetailDto, ListArtistDto, UpdateArtistDto } from './artist.dto';
import { ArtistOptionsResponse, DetailArtistResponse, ListArtistResponse } from './artist.types';

@Injectable()
export class ArtistService {
  constructor(
    private readonly appLoggerService: AppLoggerService,
    private readonly utilsService: UtilsService,
    private readonly uploadWorkerService: UploadWorkerService,

    @InjectRepository(ProductArtists)
    private readonly ArtistRepository: Repository<ProductArtists>,
  ) {}

  /**
   * Handle get detail artist service
   * @param dto
   * @returns
   */
  async getDetailArtist(dto: DetailDto): Promise<DetailArtistResponse> {
    const getArtist = await this.ArtistRepository.createQueryBuilder('artist')
      .select([
        'artist.id AS id',
        'artist.name AS name',
        'artist.email AS email',
        'artist.phone AS phone',
        'artist.image AS image',
        'artist.desc AS desc',
        'artist.status AS status',
      ])
      .where('artist.id = :id', { id: dto.id })
      .getRawOne();

    if (!getArtist) {
      throw new NotFoundException('Artist not found');
    }

    return {
      id: getArtist.id,
      name: getArtist.name,
      email: getArtist.email,
      phone: getArtist.phone,
      image: getArtist.image,
      desc: getArtist.desc,
      status: getArtist.status,
    };
  }

  /**
   * Handle get artist options service
   * @returns
   */
  async getArtistOptions(): Promise<ArtistOptionsResponse[]> {
    const getArtist = await this.ArtistRepository.createQueryBuilder('artist')
      .select(['artist.id AS id', 'artist.name AS name'])
      .where('artist.status = :status', { status: 1 })
      .getRawMany();

    return getArtist as ArtistOptionsResponse[];
  }

  /**
   * Handle get list artist service
   * @param dto
   * @returns
   */
  async getListArtist(dto: ListArtistDto): Promise<ListArtistResponse> {
    const pagination = this.utilsService.pagination(dto);
    const {
      page,
      limit,
      skip,
      status,
      orderBy = 'artist.id',
      sort = 'DESC',
      search,
      startDate,
      endDate,
    } = pagination;

    const baseQuery = this.ArtistRepository.createQueryBuilder('artist');

    if (search) {
      baseQuery.andWhere(
        new Brackets((qb) => {
          qb.where('artist.name ILIKE :search', { search: `%${search}%` })
            .orWhere('artist.email ILIKE :search', { search: `%${search}%` })
            .orWhere('artist.phone ILIKE :search', { search: `%${search}%` });
        }),
      );
    }

    if (status !== undefined) {
      baseQuery.andWhere('artist.status = :status', { status: status });
    }

    if (startDate && endDate) {
      baseQuery.andWhere('DATE(artist.created_at) BETWEEN :start_date AND :end_date', {
        start_date: startDate,
        end_date: endDate,
      });
    }

    const countQuery = baseQuery.clone();
    const itemsQuery = baseQuery
      .select([
        'artist.id AS id',
        'artist.name AS name',
        'artist.email AS email',
        'artist.phone AS phone',
        'artist.status AS status',
        `CASE
          WHEN artist.status = 1 THEN 'Active'
          ELSE 'Inactive'
         END AS status_text`,
        'artist.created_at AS created_at',
        'artist.updated_at AS updated_at',
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
   * Handle create artist service
   * @param dto
   * @param image
   * @param user
   * @returns
   */
  async createArtist(
    dto: CreateArtistDto,
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

    const getArtist = await this.ArtistRepository.createQueryBuilder('artist')
      .select(['artist.id AS id'])
      .where('LOWER(artist.name) = LOWER(:name)', { name: dto.name })
      .getRawOne();

    if (getArtist) {
      throw new BadRequestException('Name already exists');
    }

    const formatName = this.utilsService.validateUpperCase(dto.name);
    const formatSlug = this.utilsService.validateSlug(dto.name);
    const formatPhone = this.utilsService.validateReplacePhone(dto.phone, '08');
    const formatImage = this.utilsService.validateFile(image, {
      dest: '/artist',
      type: 'image',
    });

    await this.ArtistRepository.insert({
      name: formatName,
      slug: formatSlug,
      email: dto.email,
      phone: formatPhone,
      image: formatImage.fullpath,
      desc: dto.desc,
      created_by: user.id,
    });

    void this.uploadWorkerService.run({
      task: 'image.processing',
      data: {
        context: 'artist',
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
   * Handle update artist service
   * @param dto
   * @param image
   * @param user
   * @returns
   */
  async updateArtist(
    dto: UpdateArtistDto,
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

    const getArtist = await this.ArtistRepository.findOne({
      where: {
        id: dto.id,
      },
      select: ['id', 'name', 'image'],
    });

    if (!getArtist) {
      throw new NotFoundException('Artist not found');
    }

    if (getArtist.name.toLowerCase() !== dto.name.toLowerCase()) {
      const checkArtist = await this.ArtistRepository.createQueryBuilder('artist')
        .select(['artist.id AS id'])
        .where('LOWER(artist.name) = LOWER(:name)', { name: dto.name })
        .getRawOne();

      if (checkArtist) {
        throw new BadRequestException('Name already exists');
      }
    }

    let filepath = '';
    let fullpath = '';

    if (dto.is_update_image) {
      if (!image) throw new BadRequestException('Image is required');

      const file = this.utilsService.validateFile(image, {
        dest: '/artist',
        type: 'image',
      });

      filepath = file.filepath;
      fullpath = file.fullpath;
    }

    const formatName = this.utilsService.validateUpperCase(dto.name);
    const formatSlug = this.utilsService.validateSlug(dto.name);
    const formatPhone = this.utilsService.validateReplacePhone(dto.phone, '08');
    const formatImage = dto.is_update_image ? fullpath : getArtist.image;

    await this.ArtistRepository.update(
      {
        id: dto.id,
      },
      {
        name: formatName,
        slug: formatSlug,
        email: dto.email,
        phone: formatPhone,
        image: formatImage,
        desc: dto.desc,
        status: dto.status,
        updated_by: user.id,
      },
    );

    if (dto.is_update_image) {
      void this.uploadWorkerService.run({
        task: 'image.processing',
        data: {
          context: 'artist',
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
