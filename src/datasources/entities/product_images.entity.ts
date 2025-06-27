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

@Entity({ name: 'product_images' })
export class ProductImages {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: true })
  @Index()
  product_id: number;

  @ManyToOne(() => Products, (product) => product.product_images)
  @JoinColumn({ name: 'product_id', referencedColumnName: 'id' })
  product: Products;

  @Column({ type: 'varchar', length: 100 })
  image: string;

  @Column({
    type: 'smallint',
    default: 1,
    comment: '0 -> inactive, 1 -> active',
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
