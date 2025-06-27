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

@Entity({ name: 'product_awards' })
export class ProductAwards {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: true })
  @Index()
  product_id: number;

  @ManyToOne(() => Products, (product) => product.award)
  @JoinColumn({ name: 'product_id', referencedColumnName: 'id' })
  product: Products;

  @Column({ type: 'varchar', length: 100 })
  title: string;

  @Column({ type: 'text', default: '' })
  desc: string;

  @Column({ type: 'char', length: 4 })
  year: string;

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
