import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Products } from './products.entity';
import { ProductCategory } from './product_category.entity';

@Entity({ name: 'product_sub_category' })
export class ProductSubCategory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: true })
  @Index()
  category_id: number;

  @ManyToOne(() => ProductCategory, (category) => category.sub_category)
  @JoinColumn({ name: 'category_id', referencedColumnName: 'id' })
  category: ProductCategory;

  @Column({ type: 'varchar', length: 50 })
  name: string;

  @Column({ type: 'varchar', length: 100 })
  desc: string;

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

  @OneToMany(() => Products, (product) => product.sub_category)
  product: Products[];
}
