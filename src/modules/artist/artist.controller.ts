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
import { multerOptions } from 'src/commons/multer';

import { ArtistService } from './artist.service';
import { CreateArtistDto, DetailDto, ListArtistDto, UpdateArtistDto } from './artist.dto';
import { ArtistOptionsResponse, DetailArtistResponse, ListArtistResponse } from './artist.types';

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
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create artist' })
  @UseInterceptors(
    FileInterceptor('image', multerOptions(['image/jpg', 'image/jpeg', 'image/png'], 5)),
  )
  async createArtist(
    @Body() dto: CreateArtistDto,
    @UploadedFile() image: Express.Multer.File,
    @User() user: IUser,
  ): Promise<MutationResponse> {
    return await this.artistService.createArtist(dto, image, user);
  }

  @Patch()
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Update artist' })
  @UseInterceptors(
    FileInterceptor('image', multerOptions(['image/jpg', 'image/jpeg', 'image/png'], 5)),
  )
  async updateArtist(
    @Body() dto: UpdateArtistDto,
    image: Express.Multer.File,
    @User() user: IUser,
  ): Promise<MutationResponse> {
    return await this.artistService.updateArtist(dto, image, user);
  }
}
