import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from 'src/commons/guards';

import { MenuService } from './menu.service';
import { MenuResponse } from './menu.types';

@ApiTags('Menu')
@UseGuards(JwtAuthGuard)
@Controller({
  path: 'master',
  version: '1',
})
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Get('/menu')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get menu' })
  async getMenu(): Promise<MenuResponse> {
    return await this.menuService.getMenu();
  }
}
