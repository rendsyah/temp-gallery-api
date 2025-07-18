import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { TransactionStatus } from '../../commons/constants';

import { TransactionItems } from './transaction_items.entity';

@Entity({ name: 'transactions' })
export class Transactions {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 100 })
  email: string;

  @Column({ type: 'varchar', length: 25 })
  phone: string;

  @Column({ type: 'text', default: '' })
  message: string;

  @Column({ type: 'numeric', precision: 15, scale: 0 })
  sub_total: number;

  @Column({ type: 'numeric', precision: 15, scale: 0 })
  shipping_fee: number;

  @Column({ type: 'numeric', precision: 15, scale: 0 })
  grand_total: number;

  @Column({
    type: 'smallint',
    default: TransactionStatus.PENDING,
    comment:
      '0 -> pending, 1 -> waiting process, 2 -> process, 3 -> shipped, 4 -> delivered, 5 -> completed, 6 -> cancelled, 7 -> failed, 8 -> refunded',
  })
  transaction_status: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP(6)' })
  transaction_date: Date | string;

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

  @OneToMany(() => TransactionItems, (transaction_items) => transaction_items.transaction)
  transaction_items: TransactionItems[];
}
