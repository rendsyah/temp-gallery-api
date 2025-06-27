import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';

import { UtilsService } from 'src/commons/utils';
import { Transactions } from 'src/datasources/entities';

import { DetailDto, ListTransactionDto } from './transaction.dto';
import { DetailTransactionResponse, ListTransactionResponse } from './transaction.types';

@Injectable()
export class TransactionService {
  constructor(
    private readonly utilsService: UtilsService,

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
        'transaction.sub_total AS sub_total',
        'transaction.shipping_fee AS shipping_fee',
        'transaction.grand_total AS grand_total',
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
        'transaction_items.price AS price',
        'transaction_items.total_price AS total_price',
        'transaction_items.notes AS notes',
        'transaction.transaction_status AS transaction_status',
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

    baseQuery.select([
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
}
