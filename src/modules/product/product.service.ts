import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, QueryRunner, Repository } from 'typeorm';

import { AppLoggerService } from 'src/commons/logger';
import { UtilsService } from 'src/commons/utils';
import { RunnerService } from 'src/datasources/runner';
import { IUser, MutationResponse } from 'src/commons/utils/utils.types';
import { ProductImages, Products } from 'src/datasources/entities';
import { UploadWorkerService } from 'src/workers/upload';

import {
  CreateProductDto,
  DetailDto,
  ListProductDto,
  UpdateProductDto,
  UpdateProductImageDto,
} from './product.dto';
import { DetailProductResponse, ListProductResponse } from './product.types';

@Injectable()
export class ProductService {
  constructor(
    private readonly appLoggerService: AppLoggerService,
    private readonly utilsService: UtilsService,
    private readonly runnerService: RunnerService,
    private readonly uploadWorkerService: UploadWorkerService,

    @InjectRepository(Products)
    private readonly ProductRepository: Repository<Products>,
    @InjectRepository(ProductImages)
    private readonly ProductImageRepository: Repository<ProductImages>,
  ) {}

  /**
   * Handle get detail product service
   * @param dto
   * @returns
   */
  async getDetailProduct(dto: DetailDto): Promise<DetailProductResponse> {
    const getProduct = await this.ProductRepository.createQueryBuilder('product')
      .innerJoin('product.product_images', 'product_images')
      .select([
        'product.id AS id',
        'product.artist_id AS artist_id',
        'product.theme_id AS theme_id',
        'product.category_id AS category_id',
        'product.sub_category_id AS sub_category_id',
        'product.name AS name',
        'product.sku AS sku',
        'product.year AS year',
        'product_images.id AS image_id',
        'product_images.image AS image',
        'product.width::INTEGER AS width',
        'product.length::INTEGER AS length',
        'product.unit AS unit',
        'product.price::INTEGER AS price',
        'product.desc AS desc',
        'product.status AS status',
      ])
      .where('product.id = :id', { id: dto.id })
      .getRawMany();

    if (getProduct.length === 0) {
      throw new NotFoundException('Product not found');
    }

    return {
      id: getProduct[0].id,
      artist_id: getProduct[0].artist_id,
      theme_id: getProduct[0].theme_id,
      category_id: getProduct[0].category_id,
      sub_category_id: getProduct[0].sub_category_id,
      name: getProduct[0].name,
      sku: getProduct[0].sku,
      year: getProduct[0].year,
      width: getProduct[0].width,
      length: getProduct[0].length,
      unit: getProduct[0].unit,
      price: getProduct[0].price,
      desc: getProduct[0].desc,
      status: getProduct[0].status,
      images: getProduct.map((product) => ({
        id: product.image_id,
        image: product.image,
      })),
    };
  }

  /**
   * Handle get list product service
   * @param dto
   * @returns
   */
  async getListProduct(dto: ListProductDto): Promise<ListProductResponse> {
    const pagination = this.utilsService.pagination(dto);
    const {
      page,
      limit,
      skip,
      status,
      orderBy = 'product.id',
      sort = 'DESC',
      search,
      startDate,
      endDate,
    } = pagination;

    const baseQuery = this.ProductRepository.createQueryBuilder('product')
      .innerJoin('product.artist', 'artist')
      .innerJoin('product.theme', 'theme')
      .innerJoin('product.category', 'category');

    if (search) {
      baseQuery.andWhere(
        new Brackets((qb) => {
          qb.where('artist.name ILIKE :search', { search: `%${search}%` })
            .orWhere('theme.name ILIKE :search', { search: `%${search}%` })
            .orWhere('product.name ILIKE :search', { search: `%${search}%` });
        }),
      );
    }

    if (status !== undefined) {
      baseQuery.andWhere('product.status = :status', { status: status });
    }

    if (startDate && endDate) {
      baseQuery.andWhere('DATE(product.created_at) BETWEEN :start_date AND :end_date', {
        start_date: startDate,
        end_date: endDate,
      });
    }

    const countQuery = baseQuery.clone();
    const itemsQuery = baseQuery
      .select([
        'product.id AS id',
        'artist.name AS artist_name',
        'theme.name AS theme_name',
        'category.name AS category_name',
        'product.name AS name',
        'product.status AS status',
        `CASE
          WHEN product.status = 1 THEN 'Active'
          ELSE 'Inactive'
         END AS status_text`,
        'product.created_at AS created_at',
        'product.updated_at AS updated_at',
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
   * Handle create product service
   * @param dto
   * @param images
   * @param user
   * @returns
   */
  async createProduct(
    dto: CreateProductDto,
    images: Express.Multer.File[],
    user: IUser,
  ): Promise<MutationResponse> {
    this.appLoggerService.addMeta('multipart/form-data', {
      ...dto,
      images: images.map((img) => ({
        fieldname: img.fieldname,
        original_name: img.originalname,
        mimetype: img.mimetype,
        size: img.size,
      })),
    });

    const getProduct = await this.ProductRepository.createQueryBuilder('product')
      .select(['product.id AS id'])
      .where('LOWER(product.name) = LOWER(:name)', { name: dto.name })
      .getRawOne();

    if (getProduct) {
      throw new BadRequestException('Name already exists');
    }

    const getProductSku = await this.ProductRepository.createQueryBuilder('product')
      .select(['product.id AS id'])
      .where('LOWER(product.sku) = LOWER(:sku)', { sku: dto.sku })
      .getRawOne();

    if (getProductSku) {
      throw new BadRequestException('SKU already exists');
    }

    const formatName = this.utilsService.validateUpperCase(dto.name);
    const formatSlug = this.utilsService.validateSlug(dto.name);
    const formatImages = await Promise.all(
      images.map((img) =>
        this.utilsService.validateFile(img, {
          dest: '/product',
          type: 'image',
        }),
      ),
    );

    await this.runnerService.runTransaction(async (queryRunner: QueryRunner) => {
      const productResult = await queryRunner.manager.insert(Products, {
        artist_id: dto.artist_id,
        theme_id: dto.theme_id,
        category_id: dto.category_id,
        sub_category_id: dto.sub_category_id,
        name: formatName,
        slug: formatSlug,
        sku: dto.sku,
        year: dto.year,
        width: dto.width,
        length: dto.length,
        unit: dto.unit,
        price: dto.price,
        desc: dto.desc,
        created_by: user.id,
      });

      const insertImages = formatImages.map((img) => ({
        product_id: +productResult.generatedMaps[0].id,
        image: img.fullpath,
        created_by: user.id,
      }));

      await queryRunner.manager
        .createQueryBuilder(ProductImages, 'product_images')
        .insert()
        .into(ProductImages)
        .values(insertImages)
        .execute();
    });

    void Promise.all(
      formatImages.map((img, i) =>
        this.uploadWorkerService.run({
          task: 'image.processing',
          data: {
            context: 'product',
            buffer: images[i].buffer,
            original_name: images[i].originalname,
            filename: img.fullpath,
            dest: img.filepath,
          },
        }),
      ),
    );

    return {
      success: true,
      message: 'Successfully created',
    };
  }

  /**
   * Handle update product service
   * @param dto
   * @param user
   * @returns
   */
  async updateProduct(dto: UpdateProductDto, user: IUser): Promise<MutationResponse> {
    const getProduct = await this.ProductRepository.findOne({
      where: {
        id: dto.id,
      },
      select: ['id', 'name', 'sku'],
    });

    if (!getProduct) {
      throw new NotFoundException('Product not found');
    }

    if (getProduct.sku.toLowerCase() !== dto.sku.toLowerCase()) {
      const checkProductSku = await this.ProductRepository.createQueryBuilder('product')
        .select(['product.id AS id'])
        .where('LOWER(product.sku) = LOWER(:sku)', { sku: dto.sku })
        .getRawOne();

      if (checkProductSku) {
        throw new BadRequestException('SKU already exists');
      }
    }

    if (getProduct.name.toLowerCase() !== dto.name.toLowerCase()) {
      const checkProduct = await this.ProductRepository.createQueryBuilder('product')
        .select(['product.id AS id'])
        .where('LOWER(product.name) = LOWER(:name)', { name: dto.name })
        .getRawOne();

      if (checkProduct) {
        throw new BadRequestException('Name already exists');
      }
    }

    const formatName = this.utilsService.validateUpperCase(dto.name);
    const formatSlug = this.utilsService.validateSlug(dto.name);

    await this.ProductRepository.update(
      {
        id: dto.id,
      },
      {
        artist_id: dto.artist_id,
        theme_id: dto.theme_id,
        category_id: dto.category_id,
        sub_category_id: dto.sub_category_id,
        name: formatName,
        slug: formatSlug,
        sku: dto.sku,
        year: dto.year,
        width: dto.width,
        length: dto.length,
        unit: dto.unit,
        price: dto.price,
        desc: dto.desc,
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
   * Handle update product image service
   * @param dto
   * @param images
   * @param user
   * @returns
   */
  async updateProductImage(
    dto: UpdateProductImageDto,
    images: Express.Multer.File[],
    user: IUser,
  ): Promise<MutationResponse> {
    this.appLoggerService.addMeta('multipart/form-data', {
      ...dto,
      images: images.map((img) => ({
        fieldname: img.fieldname,
        original_name: img.originalname,
        mimetype: img.mimetype,
        size: img.size,
      })),
    });

    const getProduct = await this.ProductRepository.findOne({
      where: {
        id: dto.product_id,
      },
      select: ['id'],
    });

    if (!getProduct) {
      throw new NotFoundException('Product not found');
    }

    if (dto.image_ids && dto.image_ids.length > 0) {
      const found = await this.ProductImageRepository.createQueryBuilder('product_images')
        .select('product_images.id', 'id')
        .where('product_images.id IN (:...ids)', { ids: dto.image_ids })
        .getRawMany();

      const foundIds = found.map((img) => img.id as number);
      const missingIds = dto.image_ids.filter((id) => !foundIds.includes(id));

      if (missingIds.length > 0) {
        throw new NotFoundException(`Product Images not found: ${missingIds.join(', ')}`);
      }
    }

    const updateValues: string[] = [];
    const insertValues: Array<{
      product_id: number;
      image: string;
      created_by: number;
    }> = [];
    const uploadQueue: Array<{
      context: string;
      buffer: Buffer;
      original_name: string;
      filename: string;
      dest: string;
    }> = [];

    images.forEach((img, idx) => {
      const meta = this.utilsService.validateFile(img, {
        dest: '/product',
        type: 'image',
      });

      uploadQueue.push({
        context: 'product',
        buffer: img.buffer,
        original_name: img.originalname,
        filename: meta.fullpath,
        dest: meta.filepath,
      });

      if (dto.image_ids && idx < dto.image_ids.length) {
        updateValues.push(`(${dto.image_ids[idx]}, '${meta.fullpath}', ${user.id})`);
      } else {
        insertValues.push({
          product_id: dto.product_id,
          image: meta.fullpath,
          created_by: user.id,
        });
      }
    });

    await this.runnerService.runTransaction(async (queryRunner) => {
      if (updateValues.length > 0) {
        const query = `
          WITH data (id, image, updated_by) AS (
            VALUES ${updateValues.join(',')}
          )
          UPDATE product_images pi
          SET image = data.image,
              updated_by = data.updated_by
          FROM data
          WHERE pi.id = data.id
        `;
        await queryRunner.query(query);
      }

      if (insertValues.length > 0) {
        await queryRunner.manager
          .createQueryBuilder(ProductImages, 'product_images')
          .insert()
          .into(ProductImages)
          .values(insertValues)
          .execute();
      }
    });

    void Promise.all(
      uploadQueue.map((file) =>
        this.uploadWorkerService.run({
          task: 'image.processing',
          data: file,
        }),
      ),
    );

    return {
      success: true,
      message: 'Successfully updated',
    };
  }
}
