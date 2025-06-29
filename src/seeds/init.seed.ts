import { DataSource } from 'typeorm';
import argon2 from '@node-rs/argon2';

import { MasterMenu, User, UserAccess, UserAccessDetail } from '../datasources/entities';

export const seedInit = async (dataSource: DataSource) => {
  const accessRepository = dataSource.getRepository(UserAccess);
  const userRepository = dataSource.getRepository(User);

  const [accessCount, userCount] = await Promise.all([
    accessRepository.count(),
    userRepository.count(),
  ]);

  if (accessCount === 0 && userCount === 0) {
    await dataSource.transaction(async (manager) => {
      const menu = await manager
        .getRepository(MasterMenu)
        .createQueryBuilder()
        .insert()
        .into(MasterMenu)
        .values([
          {
            name: 'Dashboard',
            path: '/dashboard',
            icon: 'Dashboard',
            level: 1,
            header: 0,
            sort: 1,
          },
          {
            name: 'Maintaince',
            path: '',
            icon: 'Maintaince',
            level: 1,
            header: 0,
            sort: 2,
          },
          {
            name: 'User',
            path: '/maintaince/user',
            icon: '',
            level: 2,
            header: 2,
            sort: 1,
          },
          {
            name: 'Role',
            path: '/maintaince/role',
            icon: '',
            level: 2,
            header: 2,
            sort: 2,
          },
          {
            name: 'Role Menu',
            path: '/maintaince/role-menu',
            icon: '',
            level: 2,
            header: 2,
            sort: 3,
          },
          {
            name: 'Master Setup',
            path: '',
            icon: 'Setup',
            level: 1,
            header: 0,
            sort: 3,
          },
          {
            name: 'Banner',
            path: '/master-setup/banner',
            icon: '',
            level: 2,
            header: 6,
            sort: 1,
          },
          {
            name: 'Article',
            path: '/master-setup/article',
            icon: '',
            level: 2,
            header: 6,
            sort: 2,
          },
          {
            name: 'Contact',
            path: '/master-setup/contact',
            icon: '',
            level: 2,
            header: 6,
            sort: 3,
          },
          {
            name: 'Master Product',
            path: '',
            icon: 'Product',
            level: 1,
            header: 0,
            sort: 4,
          },
          {
            name: 'Category',
            path: '/master-product/category',
            icon: '',
            level: 2,
            header: 10,
            sort: 1,
          },
          {
            name: 'Sub Category',
            path: '/master-product/sub-category',
            icon: '',
            level: 2,
            header: 10,
            sort: 2,
          },
          {
            name: 'Field Category',
            path: '/master-product/field-category',
            icon: '',
            level: 2,
            header: 10,
            sort: 3,
          },
          {
            name: 'Theme',
            path: '/master-product/theme',
            icon: '',
            level: 2,
            header: 10,
            sort: 4,
          },
          {
            name: 'Product',
            path: '/master-product/product',
            icon: '',
            level: 2,
            header: 10,
            sort: 5,
          },
          {
            name: 'Order',
            path: '',
            icon: 'Order',
            level: 1,
            header: 0,
            sort: 5,
          },
          {
            name: 'Order List',
            path: 'order/order-list',
            icon: '',
            level: 2,
            header: 16,
            sort: 1,
          },
        ])
        .execute();

      const accessResult = await manager.getRepository(UserAccess).insert({
        name: 'Superuser',
        description: 'Superuser Access',
      });

      const insertAccessDetail = menu.generatedMaps.map((item) => ({
        access_id: +accessResult.generatedMaps[0].id,
        menu_id: +item.id,
        m_created: 1,
        m_updated: 1,
        m_deleted: 1,
      }));

      await manager
        .getRepository(UserAccessDetail)
        .createQueryBuilder()
        .insert()
        .into(UserAccessDetail)
        .values(insertAccessDetail)
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
