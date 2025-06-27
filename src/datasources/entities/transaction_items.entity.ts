import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Products } from './products.entity';
import { Transactions } from './transactions.entity';

@Entity({ name: 'transaction_items' })
export class TransactionItems {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: true })
  @Index()
  transaction_id: number;

  @ManyToOne(() => Transactions, (transaction) => transaction.transaction_items)
  @JoinColumn({ name: 'transaction_id', referencedColumnName: 'id' })
  transaction: Transactions;

  @Column({ type: 'int', nullable: true })
  @Index()
  product_id: number;

  @ManyToOne(() => Products, (product) => product.transaction_items)
  @JoinColumn({ name: 'product_id', referencedColumnName: 'id' })
  product: Products;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'numeric', precision: 15, scale: 0, default: 0 })
  price: number;

  @Column({ type: 'numeric', precision: 15, scale: 0, default: 0 })
  total_price: number;

  @Column({ type: 'text', default: '' })
  notes: string;

  @Column({
    type: 'smallint',
    default: 1,
    comment: '0 -> unpaid, 1 -> paid',
  })
  status: number;

  @Column({ type: 'int', default: null, nullable: true })
  @Index()
  created_by: number;

  @Column({ type: 'int', default: null, nullable: true })
  @Index()
  updated_by: number;

  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
  })
  created_at: Date | string;

  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
  })
  updated_at: Date | string;
}
