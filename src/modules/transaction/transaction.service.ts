import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, QueryRunner, Repository } from 'typeorm';

import { UtilsService } from 'src/commons/utils';
import { RunnerService } from 'src/datasources/runner';
import { IUser, MutationResponse } from 'src/commons/utils/utils.types';
import { TransactionItems, Transactions } from 'src/datasources/entities';

import { ProductService } from '../product/product.service';

import { CreateTransactionDto, DetailDto, ListTransactionDto } from './transaction.dto';
import { DetailTransactionResponse, ListTransactionResponse } from './transaction.types';

@Injectable()
export class TransactionService {
  constructor(
    private readonly utilsService: UtilsService,
    private readonly runnerService: RunnerService,
    private readonly productService: ProductService,

    @InjectRepository(Transactions)
    private readonly TransactionRepository: Repository<Transactions>,
  ) {}

  /**
   * Handle get detail transaction service
   * @param dto
   * @returns
   */
  async getDetailTransaction(dto: DetailDto): Promise<DetailTransactionResponse> {
    const getTransaction = await this.TransactionRepository.createQueryBuilder('transaction')
      .innerJoin('transaction.transaction_items', 'transaction_items')
      .innerJoin('transaction_items.product', 'product')
      .select([
        'transaction.id AS id',
        'transaction.name AS name',
        'transaction.email AS email',
        'transaction.phone AS phone',
        'transaction.message AS message',
        'transaction.sub_total::INTEGER AS sub_total',
        'transaction.shipping_fee::INTEGER AS shipping_fee',
        'transaction.grand_total::INTEGER AS grand_total',
        'transaction_items.product_id AS product_id',
        'product.name AS product_name',
        `(
          SELECT pi.image
          FROM product_images AS pi
          WHERE pi.product_id = product.id
          ORDER BY pi.id ASC
          LIMIT 1
         ) AS product_image`,
        'transaction_items.quantity AS quantity',
        'transaction_items.price::INTEGER AS price',
        'transaction_items.total_price::INTEGER AS total_price',
        'transaction_items.notes AS notes',
        'transaction.transaction_status AS transaction_status',
        `CASE
          WHEN transaction.transaction_status = 0 THEN 'Pending'
          WHEN transaction.transaction_status = 1 THEN 'Waiting Process'
          WHEN transaction.transaction_status = 2 THEN 'Process'
          WHEN transaction.transaction_status = 3 THEN 'Shipped'
          WHEN transaction.transaction_status = 4 THEN 'Delivered'
          WHEN transaction.transaction_status = 5 THEN 'Completed'
          WHEN transaction.transaction_status = 6 THEN 'Cancelled'
          WHEN transaction.transaction_status = 7 THEN 'Failed'
          WHEN transaction.transaction_status = 8 THEN 'Refunded'
         END AS transaction_status_text`,
        'transaction.transaction_date AS transaction_date',
      ])
      .where('transaction.id = :id', { id: dto.id })
      .getRawMany();

    if (getTransaction.length === 0) {
      throw new NotFoundException('Transaction not found');
    }

    return {
      id: getTransaction[0].id,
      name: getTransaction[0].name,
      email: getTransaction[0].email,
      phone: getTransaction[0].phone,
      message: getTransaction[0].message,
      sub_total: getTransaction[0].sub_total,
      shipping_fee: getTransaction[0].shipping_fee,
      grand_total: getTransaction[0].grand_total,
      transaction_items: getTransaction.map((transaction) => ({
        product_id: transaction.product_id,
        product_name: transaction.product_name,
        product_image: transaction.product_image,
        quantity: transaction.quantity,
        price: transaction.price,
        total_price: transaction.total_price,
        notes: transaction.notes,
      })),
      transaction_status: getTransaction[0].transaction_status,
      transaction_date: getTransaction[0].transaction_date,
    };
  }

  /**
   * Handle get list transaction service
   * @param dto
   * @returns
   */
  async getListTransaction(dto: ListTransactionDto): Promise<ListTransactionResponse> {
    const pagination = this.utilsService.pagination(dto);
    const {
      page,
      limit,
      skip,
      status,
      orderBy = 'transaction.id',
      sort = 'DESC',
      search,
      startDate,
      endDate,
    } = pagination;

    const baseQuery = this.TransactionRepository.createQueryBuilder('transaction');

    if (search) {
      baseQuery.andWhere(
        new Brackets((qb) => {
          qb.where('transaction.name ILIKE :search', { search: `%${search}%` })
            .orWhere('transaction.email ILIKE :search', { search: `%${search}%` })
            .orWhere('transaction.phone ILIKE :search', { search: `%${search}%` });
        }),
      );
    }

    if (status !== undefined) {
      baseQuery.andWhere('transaction.transaction_status = :status', { status: status });
    }

    if (startDate && endDate) {
      baseQuery.andWhere('DATE(transaction.transaction_date) BETWEEN :start_date AND :end_date', {
        start_date: startDate,
        end_date: endDate,
      });
    }

    const countQuery = baseQuery.clone();
    const itemsQuery = baseQuery
      .select([
        'transaction.id AS id',
        'transaction.name AS name',
        'transaction.email AS email',
        'transaction.phone AS phone',
        'transaction.grand_total::INTEGER AS grand_total',
        'transaction.transaction_status AS transaction_status',
        `CASE
          WHEN transaction.transaction_status = 0 THEN 'Pending'
          WHEN transaction.transaction_status = 1 THEN 'Waiting Process'
          WHEN transaction.transaction_status = 2 THEN 'Process'
          WHEN transaction.transaction_status = 3 THEN 'Shipped'
          WHEN transaction.transaction_status = 4 THEN 'Delivered'
          WHEN transaction.transaction_status = 5 THEN 'Completed'
          WHEN transaction.transaction_status = 6 THEN 'Cancelled'
          WHEN transaction.transaction_status = 7 THEN 'Failed'
          WHEN transaction.transaction_status = 8 THEN 'Refunded'
         END AS transaction_status_text`,
        'transaction.transaction_date AS transaction_date',
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
   * Handle create transaction service
   * @param dto
   * @param user
   * @returns
   */
  async createTransaction(dto: CreateTransactionDto, user: IUser): Promise<MutationResponse> {
    await this.runnerService.runTransaction(async (queryRunner: QueryRunner) => {
      const transactionItems: Partial<TransactionItems>[] = [];
      const transactionCalc = {
        sub_total: 0,
        shipping_fee: 0,
      };

      for (const item of dto.items) {
        const getProduct = await this.productService.getDetailProduct({ id: item.product_id });

        if (!getProduct) {
          throw new BadRequestException('Product not found');
        }

        const price = getProduct.price;
        const qty = item.quantity;
        const totalPrice = qty * price;

        transactionCalc.sub_total += totalPrice;

        transactionItems.push({
          product_id: item.product_id,
          quantity: qty,
          price: price,
          total_price: totalPrice,
          notes: item.notes,
        });
      }

      const grandTotal = transactionCalc.sub_total + transactionCalc.shipping_fee;

      const formatName = this.utilsService.validateUpperCase(dto.name);

      const transactionResult = await queryRunner.manager.insert(Transactions, {
        name: formatName,
        email: dto.email,
        phone: dto.phone,
        message: dto.message,
        sub_total: transactionCalc.sub_total,
        shipping_fee: transactionCalc.shipping_fee,
        grand_total: grandTotal,
        created_by: user.id,
      });

      const insertTransactionItems = transactionItems.map((item) => ({
        transaction_id: +transactionResult.generatedMaps[0].id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price,
        total_price: item.total_price,
        notes: item.notes,
        created_by: user.id,
      }));

      await queryRunner.manager
        .createQueryBuilder(TransactionItems, 'transaction_items')
        .insert()
        .into(TransactionItems)
        .values(insertTransactionItems)
        .execute();
    });

    return {
      success: true,
      message: 'Successfully created',
    };
  }
}
