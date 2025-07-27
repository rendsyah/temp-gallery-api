import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from 'src/commons/guards';
import { IUser, MutationResponse } from 'src/commons/utils/utils.types';
import { User } from 'src/commons/decorators';
import { FilePipe } from 'src/commons/pipes';
import { multerOptions } from 'src/commons/multer';

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
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create banner' })
  @UseInterceptors(
    FileInterceptor('image', multerOptions(['image/jpg', 'image/jpeg', 'image/png'], 5)),
  )
  async createBanner(
    @Body() dto: CreateBannerDto,
    @UploadedFile(FilePipe) image: Express.Multer.File,
    @User() user: IUser,
  ): Promise<MutationResponse> {
    return await this.bannerService.createBanner(dto, image, user);
  }

  @Patch('/banner')
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Update banner' })
  @UseInterceptors(
    FileInterceptor('image', multerOptions(['image/jpg', 'image/jpeg', 'image/png'], 5)),
  )
  async updateBanner(
    @Body() dto: UpdateBannerDto,
    @UploadedFile() image: Express.Multer.File,
    @User() user: IUser,
  ): Promise<MutationResponse> {
    return await this.bannerService.updateBanner(dto, image, user);
  }
}
