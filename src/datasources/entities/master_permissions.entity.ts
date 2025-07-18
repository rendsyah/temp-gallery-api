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

import { PERMISSION_TYPES } from '../../commons/constants';

import { MasterPrivilege } from './master_privilege.entity';

@Entity({ name: 'master_permissions' })
export class MasterPermissions {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: true })
  @Index()
  privilege_id: number;

  @ManyToOne(() => MasterPrivilege, (privilege) => privilege.permissions)
  @JoinColumn({ name: 'privilege_id', referencedColumnName: 'id' })
  privilege: MasterPrivilege;

  @Column({ type: 'varchar', length: 100, default: '' })
  path: string;

  @Column({ type: 'enum', enum: PERMISSION_TYPES })
  type: string;

  @Column({
    type: 'smallint',
    default: 1,
    comment: '0 -> not show, 1 -> show',
  })
  is_show: number;

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
