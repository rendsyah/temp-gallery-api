import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, QueryRunner, Repository } from 'typeorm';

import { UtilsService } from 'src/commons/utils';
import { RunnerService } from 'src/datasources/runner';
import { IUser } from 'src/commons/utils/utils.types';
import { ProductAwards, ProductImages, Products } from 'src/datasources/entities';

import {
  CreateProductAwardDto,
  CreateProductDto,
  DetailDto,
  ListProductDto,
  UpdateProductAwardDto,
  UpdateProductDto,
  UpdateProductImageDto,
} from './product.dto';
import {
  CreateProductAwardResponse,
  CreateProductResponse,
  DeleteProductAwardResponse,
  DetailProductResponse,
  ListProductResponse,
  ProductAwardResponse,
  UpdateProductAwardResponse,
  UpdateProductImageResponse,
  UpdateProductResponse,
} from './product.types';

@Injectable()
export class ProductService {
  constructor(
    private readonly utilsService: UtilsService,
    private readonly runnerService: RunnerService,

    @InjectRepository(Products)
    private readonly ProductRepository: Repository<Products>,
    @InjectRepository(ProductImages)
    private readonly ProductImageRepository: Repository<ProductImages>,
    @InjectRepository(ProductAwards)
    private readonly ProductAwardRepository: Repository<ProductAwards>,
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

    baseQuery.select([
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
   * Handle create product service
   * @param dto
   * @param user
   * @returns
   */
  async createProduct(dto: CreateProductDto, user: IUser): Promise<CreateProductResponse> {
    const getProduct = await this.ProductRepository.createQueryBuilder('product')
      .select(['product.id AS id'])
      .where('LOWER(product.name) = LOWER(:name)', { name: dto.name })
      .getRawOne();

    if (getProduct) {
      throw new BadRequestException('Name already exists');
    }

    const getProductSKU = await this.ProductRepository.createQueryBuilder('product')
      .select(['product.id AS id'])
      .where('LOWER(product.sku) = LOWER(:sku)', { sku: dto.sku })
      .getRawOne();

    if (getProductSKU) {
      throw new BadRequestException('SKU already exists');
    }

    const formatName = this.utilsService.validateUpperCase(dto.name);
    const formatSlug = this.utilsService.validateSlug(dto.name);
    const formatImages = await Promise.all(
      dto.images.map((image) =>
        this.utilsService.validateBase64File(image, {
          dest: '/product',
          type: 'image',
          mimes: ['image/jpeg', 'image/png'],
          maxSize: 5,
        }),
      ),
    );

    await this.runnerService.runTransaction(async (queryRunner: QueryRunner) => {
      const product = await queryRunner.manager.insert(Products, {
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

      const mapImages = formatImages.map((image) => ({
        product_id: product.generatedMaps[0].id,
        image: image,
        created_by: user.id,
      }));

      await queryRunner.manager
        .createQueryBuilder(ProductImages, 'product_images')
        .insert()
        .into(ProductImages)
        .values(mapImages)
        .execute();
    });

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
  async updateProduct(dto: UpdateProductDto, user: IUser): Promise<UpdateProductResponse> {
    const getProduct = await this.ProductRepository.findOne({
      where: {
        id: dto.id,
      },
      select: ['id', 'name'],
    });

    if (!getProduct) {
      throw new NotFoundException('Product not found');
    }

    const getProductSKU = await this.ProductRepository.createQueryBuilder('product')
      .select(['product.id AS id'])
      .where('LOWER(product.sku) = LOWER(:sku)', { sku: dto.sku })
      .getRawOne();

    if (getProductSKU) {
      throw new BadRequestException('SKU already exists');
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
   * @param user
   * @returns
   */
  async updateProductImage(
    dto: UpdateProductImageDto,
    user: IUser,
  ): Promise<UpdateProductImageResponse> {
    for (const image of dto.images) {
      const getProductImage = await this.ProductImageRepository.findOne({
        where: {
          id: image.id,
        },
        select: ['id'],
      });

      if (!getProductImage) {
        throw new NotFoundException('Product Image not found');
      }
    }

    const mapImages: string[] = [];

    dto.images.map((image) => {
      const formatImage = this.utilsService.validateBase64File(image.image, {
        dest: '/product',
        type: 'image',
        mimes: ['image/jpeg', 'image/png'],
        maxSize: 5,
      });

      mapImages.push(`(${image.id}, '${formatImage}', ${user.id})`);
    });

    const valuesImages = mapImages.join(', ');

    const queryImages = `
        WITH data (id, image, updated_by) AS (
            VALUES ${valuesImages}
        )
        UPDATE product_images pi
        SET 
          image = data.image,
          updated_by = data.updated_by
        FROM data
        WHERE pi.id = data.id
    `;

    await this.runnerService.runTransaction(async (queryRunner: QueryRunner) => {
      await queryRunner.query(queryImages);
    });

    return {
      success: true,
      message: 'Successfully updated',
    };
  }

  /**
   * Handle get product award service
   * @param dto
   * @returns
   */
  async getProductAward(dto: DetailDto): Promise<ProductAwardResponse[]> {
    const getProductAward = await this.ProductAwardRepository.createQueryBuilder('award')
      .select([
        'award.id AS id',
        'award.title AS title',
        'award.desc AS desc',
        'award.year AS year',
      ])
      .where('award.product_id = :product_id', { product_id: dto.id })
      .getRawMany();

    return getProductAward as ProductAwardResponse[];
  }

  /**
   * Handle create product award service
   * @param dto
   * @param user
   * @returns
   */
  async createProductAward(
    dto: CreateProductAwardDto,
    user: IUser,
  ): Promise<CreateProductAwardResponse> {
    const result = {
      success: true,
      message: 'Successfully created',
      awards: [],
    };

    await this.runnerService.runTransaction(async (queryRunner: QueryRunner) => {
      const award = dto.awards.map((item) => {
        const formatTitle = this.utilsService.validateUpperCase(item.title);
        return {
          product_id: dto.product_id,
          title: formatTitle,
          desc: item.desc,
          year: item.year,
          created_by: user.id,
        };
      });

      const insertResult = await queryRunner.manager
        .createQueryBuilder(ProductAwards, 'award')
        .insert()
        .into(ProductAwards)
        .values(award)
        .returning(['id', 'title', 'desc', 'year'])
        .execute();

      result.awards = insertResult.raw;
    });

    return result;
  }

  /**
   * Handle update product award service
   * @param dto
   * @param user
   * @returns
   */
  async updateProductAward(
    dto: UpdateProductAwardDto,
    user: IUser,
  ): Promise<UpdateProductAwardResponse> {
    const getProductAward = await this.ProductAwardRepository.findOne({
      where: {
        id: dto.id,
      },
      select: ['id'],
    });

    if (!getProductAward) {
      throw new BadRequestException('Product award not found');
    }

    const formatTitle = this.utilsService.validateUpperCase(dto.title);

    await this.ProductAwardRepository.update(
      {
        id: dto.id,
      },
      {
        title: formatTitle,
        desc: dto.desc,
        year: dto.year,
        updated_by: user.id,
      },
    );

    return {
      success: true,
      message: 'Successfully updated',
    };
  }

  /**
   * Handle delete product award service
   * @param dto
   * @returns
   */
  async deleteProductAward(dto: DetailDto): Promise<DeleteProductAwardResponse> {
    const getProductAward = await this.ProductAwardRepository.findOne({
      where: {
        id: dto.id,
      },
      select: ['id'],
    });

    if (!getProductAward) {
      throw new NotFoundException('Product award not found');
    }

    await this.ProductAwardRepository.delete({
      id: dto.id,
    });

    return {
      success: true,
      message: 'Successfully deleted',
    };
  }
}
