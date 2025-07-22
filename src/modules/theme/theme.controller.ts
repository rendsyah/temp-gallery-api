import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from 'src/commons/guards';
import { IUser, MutationResponse } from 'src/commons/utils/utils.types';
import { User } from 'src/commons/decorators';

import { ThemeService } from './theme.service';
import { CreateThemeDto, DetailDto, ListThemeDto, UpdateThemeDto } from './theme.dto';
import { DetailThemeResponse, ListThemeResponse, OptionsThemeResponse } from './theme.types';

@ApiTags('Theme')
@UseGuards(JwtAuthGuard)
@Controller({
  path: 'theme',
  version: '1',
})
export class ThemeController {
  constructor(private readonly themeService: ThemeService) {}

  @Get('/detail/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get detail theme' })
  async getDetailTheme(@Param() dto: DetailDto): Promise<DetailThemeResponse> {
    return await this.themeService.getDetailTheme(dto);
  }

  @Get('/options')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get options theme' })
  async getOptionsTheme(): Promise<OptionsThemeResponse[]> {
    return await this.themeService.getOptionsTheme();
  }

  @Get('/list')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get list theme' })
  async getListTheme(@Query() dto: ListThemeDto): Promise<ListThemeResponse> {
    return await this.themeService.getListTheme(dto);
  }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create theme' })
  async createTheme(@Body() dto: CreateThemeDto, @User() user: IUser): Promise<MutationResponse> {
    return await this.themeService.createTheme(dto, user);
  }

  @Patch()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update theme' })
  async updateTheme(@Body() dto: UpdateThemeDto, @User() user: IUser): Promise<MutationResponse> {
    return await this.themeService.updateTheme(dto, user);
  }
}
