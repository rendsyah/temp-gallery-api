import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UtilsService } from 'src/commons/utils';
import { IMenu, MutationResponse } from 'src/commons/utils/utils.types';
import { MasterMenu } from 'src/datasources/entities';

import { DetailDto, UpdateMenuDto } from './menu.dto';
import { DetailMenuResponse, MenuResponse } from './menu.types';

@Injectable()
export class MenuService {
  constructor(
    private readonly utilsService: UtilsService,

    @InjectRepository(MasterMenu)
    private readonly MenuRepository: Repository<MasterMenu>,
  ) {}

  /**
   * Handle get detail menu service
   * @param dto
   * @returns
   */
  async getDetailMenu(dto: DetailDto): Promise<DetailMenuResponse> {
    const getMenu = await this.MenuRepository.createQueryBuilder('menu')
      .select(['menu.id AS id', 'menu.name AS name', 'menu.sort AS sort', 'menu.status AS status'])
      .where('menu.id = :id', { id: dto.id })
      .getRawOne();

    if (!getMenu) {
      throw new NotFoundException('Menu not found');
    }

    return {
      id: getMenu.id,
      name: getMenu.name,
      sort: getMenu.sort,
      status: getMenu.status,
    };
  }

  /**
   * Handle get menu service
   * @returns
   */
  async getMenu(): Promise<MenuResponse> {
    const getMenu = await this.MenuRepository.createQueryBuilder('menu')
      .innerJoin('menu.privilege', 'privilege')
      .select([
        'menu.id AS id',
        'menu.name AS name',
        'menu.path AS path',
        'menu.icon AS icon',
        'menu.level AS level',
        'menu.parent_id AS parent_id',
        'menu.is_group AS is_group',
        'menu.sort AS sort',
        'privilege.id AS privilege_id',
        'privilege.action AS action',
      ])
      .orderBy('menu.parent_id', 'ASC')
      .addOrderBy('menu.sort', 'ASC')
      .addOrderBy('privilege.id', 'ASC')
      .getRawMany();

    const result: IMenu[] = [];
    const resultMap = new Map<number, IMenu>();

    for (const menu of getMenu) {
      if (!resultMap.has(menu.id)) {
        resultMap.set(menu.id, {
          id: menu.id,
          name: menu.name,
          path: menu.path,
          icon: menu.icon,
          level: menu.level,
          is_group: menu.is_group,
          actions: [],
          child: [],
        });
      }

      const currentMenu = resultMap.get(menu.id)!;
      currentMenu.actions?.push({
        privilege_id: menu.privilege_id,
        action: menu.action,
      });

      if (menu.parent_id === 0) {
        if (!result.includes(currentMenu)) {
          result.push(currentMenu);
        }
      } else {
        if (!resultMap.has(menu.parent_id)) {
          resultMap.set(menu.parent_id, {
            id: menu.parent_id,
            name: '',
            path: '',
            icon: '',
            level: 0,
            is_group: 1,
            actions: [],
            child: [],
          });
        }

        const parentMenu = resultMap.get(menu.parent_id)!;
        if (!parentMenu.child.includes(currentMenu)) {
          parentMenu.child.push(currentMenu);
        }
      }
    }

    return result;
  }

  /**
   * Handle update menu service
   * @param dto
   * @returns
   */
  async updateMenu(dto: UpdateMenuDto): Promise<MutationResponse> {
    const formatName = this.utilsService.validateUpperCase(dto.name);

    await this.MenuRepository.update(
      { id: dto.id },
      {
        name: formatName,
        sort: dto.sort,
        status: dto.status,
      },
    );

    return {
      success: true,
      message: 'Successfully updated',
    };
  }
}
