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

import { PERMISSION_ACTIONS } from '../../commons/constants';

import { MasterMenu } from './master_menu.entity';
import { MasterPermissions } from './master_permissions.entity';
import { UserPermissions } from './user_permissions.entity';

@Entity({ name: 'master_privilege' })
export class MasterPrivilege {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', nullable: true })
  @Index()
  menu_id: number;

  @ManyToOne(() => MasterMenu, (menu) => menu.privilege)
  @JoinColumn({ name: 'menu_id', referencedColumnName: 'id' })
  menu: MasterMenu;

  @Column({ type: 'varchar', length: 100, unique: true })
  code: string;

  @Column({ type: 'enum', enum: PERMISSION_ACTIONS })
  action: string;

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

  @OneToMany(() => MasterPermissions, (permissions) => permissions.privilege)
  permissions: MasterPermissions[];

  @OneToMany(() => UserPermissions, (user_permissions) => user_permissions.privilege)
  user_permissions: UserPermissions[];
}
