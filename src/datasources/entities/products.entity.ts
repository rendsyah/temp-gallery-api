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

import { MasterArtists } from './master_artists.entity';
import { ProductCategory } from './product_category.entity';
import { ProductSubCategory } from './product_sub_category.entity';
import { ProductThemes } from './product_themes.entity';
import { ProductImages } from './product_images.entity';
import { TransactionItems } from './transaction_items.entity';

@Entity({ name: 'products' })
export class Products {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: true })
  @Index()
  artist_id: number;

  @ManyToOne(() => MasterArtists, (artist) => artist.product)
  @JoinColumn({ name: 'artist_id', referencedColumnName: 'id' })
  artist: MasterArtists;

  @Column({ type: 'int', nullable: true })
  @Index()
  theme_id: number;

  @ManyToOne(() => ProductThemes, (theme) => theme.product)
  @JoinColumn({ name: 'theme_id', referencedColumnName: 'id' })
  theme: ProductThemes;

  @Column({ type: 'int', nullable: true })
  @Index()
  category_id: number;

  @ManyToOne(() => ProductCategory, (category) => category.product)
  @JoinColumn({ name: 'category_id', referencedColumnName: 'id' })
  category: ProductCategory;

  @Column({ type: 'int', nullable: true })
  @Index()
  sub_category_id: number;

  @ManyToOne(() => ProductSubCategory, (sub_category) => sub_category.product)
  @JoinColumn({ name: 'sub_category_id', referencedColumnName: 'id' })
  sub_category: ProductSubCategory;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 150, unique: true })
  slug: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  sku: string;

  @Column({ type: 'char', length: 4 })
  year: string;

  @Column({ type: 'numeric', precision: 10, scale: 0 })
  width: number;

  @Column({ type: 'numeric', precision: 10, scale: 0 })
  length: number;

  @Column({ type: 'varchar', length: 10, default: 'cm' })
  unit: string;

  @Column({ type: 'numeric', precision: 15, scale: 0, default: 0 })
  price: number;

  @Column({ type: 'text' })
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

  @OneToMany(() => ProductImages, (product_images) => product_images.product)
  product_images: ProductImages[];

  @OneToMany(() => TransactionItems, (transaction_items) => transaction_items.product)
  transaction_items: TransactionItems[];
}
