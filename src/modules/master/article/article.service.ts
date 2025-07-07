import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UtilsService } from 'src/commons/utils';
import { IUser, MutationResponse } from 'src/commons/utils/utils.types';
import { MasterArticles } from 'src/datasources/entities';

import { CreateArticleDto, DetailDto, ListArticleDto, UpdateArticleDto } from './article.dto';
import { DetailArticleResponse, ListArticleResponse } from './article.types';

@Injectable()
export class ArticleService {
  constructor(
    private readonly utilsService: UtilsService,

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
   * @param user
   * @returns
   */
  async createArticle(dto: CreateArticleDto, user: IUser): Promise<MutationResponse> {
    const getArticle = await this.ArticleRepository.createQueryBuilder('article')
      .select(['article.id AS id'])
      .where('LOWER(article.title) = LOWER(:title)', { title: dto.title })
      .getRawOne();

    if (getArticle) {
      throw new BadRequestException('Title already exists');
    }

    const formatSlug = this.utilsService.validateSlug(dto.title);
    const formatImage = this.utilsService.validateBase64File(dto.image, {
      dest: '/article',
      type: 'image',
      mimes: ['image/jpeg', 'image/png'],
      maxSize: 5,
    });

    await this.ArticleRepository.insert({
      title: dto.title,
      slug: formatSlug,
      image: formatImage,
      content: dto.content,
      created_by: user.id,
    });

    return {
      success: true,
      message: 'Successfully created',
    };
  }

  /**
   * Handle update article service
   * @param dto
   * @param user
   * @returns
   */
  async updateArticle(dto: UpdateArticleDto, user: IUser): Promise<MutationResponse> {
    const getArticle = await this.ArticleRepository.findOne({
      where: {
        id: dto.id,
      },
      select: ['id', 'title'],
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

    const formatSlug = this.utilsService.validateSlug(dto.title);
    const formatImage = dto.is_update_image
      ? this.utilsService.validateBase64File(dto.image, {
          dest: '/article',
          type: 'image',
          mimes: ['image/jpeg', 'image/png'],
          maxSize: 5,
        })
      : dto.image;

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

    return {
      success: true,
      message: 'Successfully updated',
    };
  }
}
