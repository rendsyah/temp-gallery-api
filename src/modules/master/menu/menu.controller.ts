import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from 'src/commons/guards';
import { MutationResponse } from 'src/commons/utils/utils.types';

import { MenuService } from './menu.service';
import { DetailDto, UpdateMenuDto } from './menu.dto';
import { DetailMenuResponse, MenuResponse } from './menu.types';

@ApiTags('Menu')
@UseGuards(JwtAuthGuard)
@Controller({
  path: 'master',
  version: '1',
})
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Get('/detail/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get detail menu' })
  async getDetailMenu(@Body() dto: DetailDto): Promise<DetailMenuResponse> {
    return await this.menuService.getDetailMenu(dto);
  }

  @Get('/menu')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get menu' })
  async getMenu(): Promise<MenuResponse> {
    return await this.menuService.getMenu();
  }

  @Patch('/menu')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update menu' })
  async updateMenu(@Body() dto: UpdateMenuDto): Promise<MutationResponse> {
    return await this.menuService.updateMenu(dto);
  }
}
