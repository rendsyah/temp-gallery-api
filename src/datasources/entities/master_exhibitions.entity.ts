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

import { MasterArtists } from './master_artists.entity';

@Entity({ name: 'master_exhibitions' })
export class MasterExhibitions {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: true })
  @Index()
  artist_id: number;

  @ManyToOne(() => MasterArtists, (artist) => artist.exhibitions)
  @JoinColumn({ name: 'artist_id', referencedColumnName: 'id' })
  artist: MasterArtists;

  @Column({ type: 'text' })
  name: string;

  @Column({ type: 'text', unique: true })
  slug: string;

  @Column({ type: 'varchar', length: 100 })
  image: string;

  @Column({ type: 'text' })
  desc: string;

  @Column({ type: 'date' })
  start_date: Date | string;

  @Column({ type: 'date' })
  end_date: Date | string;

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
