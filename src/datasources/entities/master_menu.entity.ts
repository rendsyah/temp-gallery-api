import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { MasterPrivilege } from './master_privilege.entity';

@Entity({ name: 'master_menu' })
export class MasterMenu {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 25 })
  name: string;

  @Column({ type: 'varchar', length: 100, default: '' })
  path: string;

  @Column({ type: 'varchar', length: 100, default: '' })
  icon: string;

  @Column({ type: 'smallint', default: 1 })
  level: number;

  @Column({ type: 'smallint', default: 0 })
  parent_id: number;

  @Column({ type: 'smallint', default: 0 })
  sort: number;

  @Column({
    type: 'smallint',
    default: 1,
    comment: '0 -> inactive, 1 -> active',
  })
  status: number;

  @Column({
    type: 'smallint',
    default: 0,
    comment: '0 -> inactive, 1 -> active',
  })
  is_group: number;

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

  @OneToMany(() => MasterPrivilege, (privilege) => privilege.menu)
  privilege: MasterPrivilege[];
}
