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

import { MasterPrivilege } from './master_privilege.entity';
import { UserAccess } from './user_access.entity';

@Entity({ name: 'user_permissions' })
export class UserPermissions {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: true })
  @Index()
  access_id: number;

  @ManyToOne(() => UserAccess, (user_access) => user_access.user_permissions)
  @JoinColumn({ name: 'access_id', referencedColumnName: 'id' })
  user_access: UserAccess;

  @Column({ type: 'int', nullable: true })
  @Index()
  privilege_id: number;

  @ManyToOne(() => MasterPrivilege, (privilege) => privilege.user_permissions)
  @JoinColumn({ name: 'privilege_id', referencedColumnName: 'id' })
  privilege: MasterPrivilege;

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
