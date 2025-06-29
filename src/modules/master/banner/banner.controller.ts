import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from 'src/commons/guards';
import { IUser, MutationResponse } from 'src/commons/utils/utils.types';
import { User } from 'src/commons/decorators';

import { BannerService } from './banner.service';
import { CreateBannerDto, DetailDto, ListBannerDto, UpdateBannerDto } from './banner.dto';
import { DetailBannerResponse, GetBannerTypeResponse, ListBannerResponse } from './banner.types';

@ApiTags('Banner')
@UseGuards(JwtAuthGuard)
@Controller({
  path: 'master',
  version: '1',
})
export class BannerController {
  constructor(private readonly bannerService: BannerService) {}

  @Get('/banner/detail/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get detail banner' })
  async getDetailBanner(@Param() dto: DetailDto): Promise<DetailBannerResponse> {
    return await this.bannerService.getDetailBanner(dto);
  }

  @Get('/banner/type')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get banner type' })
  async getBannerType(): Promise<GetBannerTypeResponse[]> {
    return await this.bannerService.getBannerType();
  }

  @Get('/banner/list')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get list banner' })
  async getListBanner(@Query() dto: ListBannerDto): Promise<ListBannerResponse> {
    return await this.bannerService.getListBanner(dto);
  }

  @Post('/banner')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create banner' })
  async createBanner(@Body() dto: CreateBannerDto, @User() user: IUser): Promise<MutationResponse> {
    return await this.bannerService.createBanner(dto, user);
  }

  @Patch('/banner')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update banner' })
  async updateBanner(@Body() dto: UpdateBannerDto, @User() user: IUser): Promise<MutationResponse> {
    return await this.bannerService.updateBanner(dto, user);
  }
}
