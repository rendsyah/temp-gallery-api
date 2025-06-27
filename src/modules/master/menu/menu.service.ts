import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { IMenu } from 'src/commons/utils/utils.types';
import { MasterMenu } from 'src/datasources/entities';

import { MenuResponse } from './menu.types';

@Injectable()
export class MenuService {
  constructor(
    @InjectRepository(MasterMenu)
    private readonly MenuRepository: Repository<MasterMenu>,
  ) {}

  /**
   * Handle get menu
   * @returns
   */
  async getMenu(): Promise<MenuResponse> {
    const getMenu = await this.MenuRepository.createQueryBuilder('menu')
      .select([
        'menu.id AS id',
        'menu.name AS name',
        'menu.path AS path',
        'menu.icon AS icon',
        'menu.level AS level',
        'menu.header AS header',
      ])
      .orderBy('menu.level', 'ASC')
      .addOrderBy('menu.sort', 'ASC')
      .addOrderBy('menu.id', 'ASC')
      .getRawMany();

    const menuMap = new Map<number, IMenu>();

    const result = getMenu.reduce<IMenu[]>((acc, menu) => {
      const data: IMenu = {
        id: menu.id,
        name: menu.name,
        path: menu.path,
        icon: menu.icon,
        level: menu.level,
        child: [],
      };

      menuMap.set(data.id, data);

      if (!menu.header) {
        acc.push(data);
      } else {
        const parent = menuMap.get(menu.header);
        if (parent) parent.child.push(data);
      }

      return acc;
    }, []);

    return result;
  }
}
