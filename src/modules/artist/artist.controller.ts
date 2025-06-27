import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from 'src/commons/guards';
import { IUser } from 'src/commons/utils/utils.types';
import { User } from 'src/commons/decorators';

import { ArtistService } from './artist.service';
import { CreateArtistDto, DetailDto, ListArtistDto, UpdateArtistDto } from './artist.dto';
import {
  ArtistOptionsResponse,
  CreateArtistResponse,
  DetailArtistResponse,
  ListArtistResponse,
  UpdateArtistResponse,
} from './artist.types';

@ApiTags('Artist')
@UseGuards(JwtAuthGuard)
@Controller({
  path: 'artist',
  version: '1',
})
export class ArtistController {
  constructor(private readonly artistService: ArtistService) {}

  @Get('/detail/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get detail artist' })
  async getDetailArtist(@Param() dto: DetailDto): Promise<DetailArtistResponse> {
    return await this.artistService.getDetailArtist(dto);
  }

  @Get('/options')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get artist options' })
  async getArtistOptions(): Promise<ArtistOptionsResponse[]> {
    return await this.artistService.getArtistOptions();
  }

  @Get('/list')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get list artist' })
  async getListArtist(@Query() dto: ListArtistDto): Promise<ListArtistResponse> {
    return await this.artistService.getListArtist(dto);
  }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create artist' })
  async createArtist(
    @Body() dto: CreateArtistDto,
    @User() user: IUser,
  ): Promise<CreateArtistResponse> {
    return await this.artistService.createArtist(dto, user);
  }

  @Patch()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update artist' })
  async updateArtist(
    @Body() dto: UpdateArtistDto,
    @User() user: IUser,
  ): Promise<UpdateArtistResponse> {
    return await this.artistService.updateArtist(dto, user);
  }
}
