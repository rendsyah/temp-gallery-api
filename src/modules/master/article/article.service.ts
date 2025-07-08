import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AppLoggerService } from 'src/commons/logger';
import { UtilsService } from 'src/commons/utils';
import { IUser, MutationResponse } from 'src/commons/utils/utils.types';
import { MasterArticles } from 'src/datasources/entities';
import { UploadWorkerService } from 'src/workers/upload';

import { CreateArticleDto, DetailDto, ListArticleDto, UpdateArticleDto } from './article.dto';
import { DetailArticleResponse, ListArticleResponse } from './article.types';

@Injectable()
export class ArticleService {
  constructor(
    private readonly appLoggerService: AppLoggerService,
    private readonly utilsService: UtilsService,
    private readonly uploadWorkerService: UploadWorkerService,

    @InjectRepository(MasterArticles)
    private readonly ArticleRepository: Repository<MasterArticles>,
  ) {}

  /**
   * Handle get detail article service
   * @param dto
   * @returns
   */
  async getDetailArticle(dto: DetailDto): Promise<DetailArticleResponse> {
    const getArticle = await this.ArticleRepository.createQueryBuilder('article')
      .select([
        'article.id AS id',
        'article.title AS title',
        'article.image AS image',
        'article.content AS content',
        'article.status AS status',
      ])
      .where('article.id = :id', { id: dto.id })
      .getRawOne();

    if (!getArticle) {
      throw new NotFoundException('Article not found');
    }

    return {
      id: getArticle.id,
      title: getArticle.title,
      image: getArticle.image,
      content: getArticle.content,
      status: getArticle.status,
    };
  }

  /**
   * Handle get list article service
   * @param dto
   * @returns
   */
  async getListArticle(dto: ListArticleDto): Promise<ListArticleResponse> {
    const pagination = this.utilsService.pagination(dto);
    const {
      page,
      limit,
      skip,
      status,
      orderBy = 'article.id',
      sort = 'DESC',
      search,
      startDate,
      endDate,
    } = pagination;

    const baseQuery = this.ArticleRepository.createQueryBuilder('article');

    if (search) {
      baseQuery.andWhere('article.title ILIKE :search', { search: `%${search}%` });
    }

    if (status !== undefined) {
      baseQuery.andWhere('article.status = :status', { status: status });
    }

    if (startDate && endDate) {
      baseQuery.andWhere('DATE(article.created_at) BETWEEN :start_date AND :end_date', {
        start_date: startDate,
        end_date: endDate,
      });
    }

    const countQuery = baseQuery.clone();
    const itemsQuery = baseQuery
      .select([
        'article.id AS id',
        'article.title AS title',
        'article.content AS content',
        'article.status AS status',
        `CASE
          WHEN article.status = 1 THEN 'Active'
          ELSE 'Inactive'
         END AS status_text`,
        'article.created_at AS created_at',
        'article.updated_at AS updated_at',
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
   * Handle create article service
   * @param dto
   * @param image
   * @param user
   * @returns
   */
  async createArticle(
    dto: CreateArticleDto,
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

    const getArticle = await this.ArticleRepository.createQueryBuilder('article')
      .select(['article.id AS id'])
      .where('LOWER(article.title) = LOWER(:title)', { title: dto.title })
      .getRawOne();

    if (getArticle) {
      throw new BadRequestException('Title already exists');
    }

    const formatSlug = this.utilsService.validateSlug(dto.title);
    const formatImage = this.utilsService.validateFile(image, {
      dest: '/article',
      type: 'image',
    });

    await this.ArticleRepository.insert({
      title: dto.title,
      slug: formatSlug,
      image: formatImage.fullpath,
      content: dto.content,
      created_by: user.id,
    });

    void this.uploadWorkerService.run({
      task: 'image.processing',
      data: {
        context: 'article',
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
   * Handle update article service
   * @param dto
   * @param image
   * @param user
   * @returns
   */
  async updateArticle(
    dto: UpdateArticleDto,
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

    const getArticle = await this.ArticleRepository.findOne({
      where: {
        id: dto.id,
      },
      select: ['id', 'title', 'image'],
    });

    if (!getArticle) {
      throw new NotFoundException('Article not found');
    }

    if (getArticle.title.toLowerCase() !== dto.title.toLowerCase()) {
      const checkArticle = await this.ArticleRepository.createQueryBuilder('article')
        .select(['article.id AS id'])
        .where('LOWER(article.title) = LOWER(:title)', { title: dto.title })
        .getRawOne();

      if (checkArticle) {
        throw new BadRequestException('Title already exists');
      }
    }

    let filepath = '';
    let fullpath = '';

    if (dto.is_update_image) {
      if (!image) throw new BadRequestException('Image is required');

      const file = this.utilsService.validateFile(image, {
        dest: '/article',
        type: 'image',
      });

      filepath = file.filepath;
      fullpath = file.fullpath;
    }

    const formatSlug = this.utilsService.validateSlug(dto.title);
    const formatImage = dto.is_update_image ? fullpath : getArticle.image;

    await this.ArticleRepository.update(
      {
        id: dto.id,
      },
      {
        title: dto.title,
        slug: formatSlug,
        image: formatImage,
        content: dto.content,
        status: dto.status,
        updated_by: user.id,
      },
    );

    if (dto.is_update_image) {
      void this.uploadWorkerService.run({
        task: 'image.processing',
        data: {
          context: 'article',
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
