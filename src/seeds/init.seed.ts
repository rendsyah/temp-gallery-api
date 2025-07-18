import { DataSource } from 'typeorm';
import argon2 from '@node-rs/argon2';

import { PERMISSION_ACTIONS, PERMISSION_TYPES } from '../commons/constants';

import {
  MasterMenu,
  MasterPermissions,
  MasterPrivilege,
  User,
  UserAccess,
  UserPermissions,
} from '../datasources/entities';

import { MENUS } from './mock.seed';

export const seedInit = async (dataSource: DataSource) => {
  const accessRepository = dataSource.getRepository(UserAccess);
  const userRepository = dataSource.getRepository(User);

  const [accessCount, userCount] = await Promise.all([
    accessRepository.count(),
    userRepository.count(),
  ]);

  if (accessCount === 0 && userCount === 0) {
    await dataSource.transaction(async (manager) => {
      const menuResult = await manager
        .getRepository(MasterMenu)
        .createQueryBuilder()
        .insert()
        .into(MasterMenu)
        .values(MENUS)
        .returning('*')
        .execute();

      const accessResult = await manager.getRepository(UserAccess).insert({
        name: 'Superuser',
        desc: 'Superuser Access',
        is_show: 0,
      });

      const resultMenu = menuResult.generatedMaps as MasterMenu[];
      const privileges: Partial<MasterPrivilege>[] = [];

      for (const menu of resultMenu) {
        const slug = menu.name.toUpperCase().replace(/\s+/g, '_');

        if (menu.is_group === 1) {
          privileges.push({
            menu_id: menu.id,
            code: `${slug}:VIEW`,
            action: PERMISSION_ACTIONS.VIEW,
          });
        } else {
          privileges.push({
            menu_id: menu.id,
            code: `${slug}:VIEW`,
            action: PERMISSION_ACTIONS.VIEW,
          });
          privileges.push({
            menu_id: menu.id,
            code: `${slug}:CREATE`,
            action: PERMISSION_ACTIONS.CREATE,
          });
          privileges.push({
            menu_id: menu.id,
            code: `${slug}:UPDATE`,
            action: PERMISSION_ACTIONS.UPDATE,
          });
          privileges.push({
            menu_id: menu.id,
            code: `${slug}:DELETE`,
            action: PERMISSION_ACTIONS.DELETE,
          });
        }
      }

      const privilegeResult = await manager
        .getRepository(MasterPrivilege)
        .createQueryBuilder()
        .insert()
        .into(MasterPrivilege)
        .values(privileges)
        .returning('*')
        .execute();

      const resultPrivileges = privilegeResult.generatedMaps as MasterPrivilege[];
      const permissions: Partial<MasterPermissions>[] = [];

      for (const res of resultPrivileges) {
        const indexMenu = resultMenu.findIndex((menu) => menu.id === res.menu_id);
        const menu = resultMenu[indexMenu];

        if (menu.is_group === 1) {
          continue;
        }

        if (res.action === 'view') {
          permissions.push({
            privilege_id: res.id,
            path: menu.path,
            type: PERMISSION_TYPES.ACTION,
          });
        }
        if (res.action === 'create') {
          permissions.push({
            privilege_id: res.id,
            path: `${menu.path}/create`,
            type: PERMISSION_TYPES.ACTION,
          });
        }
        if (res.action === 'update') {
          permissions.push({
            privilege_id: res.id,
            path: `${menu.path}/detail/:id`,
            type: PERMISSION_TYPES.ACTION,
          });
        }
        if (res.action === 'delete') {
          permissions.push({
            privilege_id: res.id,
            path: '',
            type: PERMISSION_TYPES.ACTION,
          });
        }
      }

      const insertUserPermissions = privilegeResult.generatedMaps.map((privilege) => ({
        access_id: +accessResult.generatedMaps[0].id,
        privilege_id: +privilege.id,
      }));

      await manager
        .getRepository(MasterPermissions)
        .createQueryBuilder()
        .insert()
        .into(MasterPermissions)
        .values(permissions)
        .execute();

      await manager
        .getRepository(UserPermissions)
        .createQueryBuilder()
        .insert()
        .into(UserPermissions)
        .values(insertUserPermissions)
        .execute();

      const formatPass = await argon2.hash('12345678');

      await manager.getRepository(User).insert({
        access_id: +accessResult.generatedMaps[0].id,
        username: 'superuser',
        password: formatPass,
        fullname: 'Ferhad Maulidi',
        email: 'superuser@gmail.com',
        phone: '08123456789',
      });
    });
  }
};
