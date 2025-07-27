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

import { ExhibitionsService } from './exhibitions.service';
import {
  CreateExhibitionDto,
  DetailDto,
  ListExhibitionDto,
  UpdateExhibitionDto,
} from './exhibitions.dto';
import { DetailExhibitionResponse, ListExhibitionResponse } from './exhibitions.types';

@ApiTags('Exhibitions')
@UseGuards(JwtAuthGuard)
@Controller({
  path: 'master',
  version: '1',
})
export class ExhibitionsController {
  constructor(private readonly exhibitionsService: ExhibitionsService) {}

  @Get('/exhibition/detail/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get detail exhibition' })
  async getDetailExhibition(@Param() dto: DetailDto): Promise<DetailExhibitionResponse> {
    return await this.exhibitionsService.getDetailExhibition(dto);
  }

  @Get('/exhibition/list')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get list exhibition' })
  async getListExhibition(@Query() dto: ListExhibitionDto): Promise<ListExhibitionResponse> {
    return await this.exhibitionsService.getListExhibition(dto);
  }

  @Post('/exhibition')
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create exhibition' })
  @UseInterceptors(
    FileInterceptor('image', multerOptions(['image/jpg', 'image/jpeg', 'image/png'], 5)),
  )
  async createExhibition(
    @Body() dto: CreateExhibitionDto,
    @UploadedFile(FilePipe) image: Express.Multer.File,
    @User() user: IUser,
  ): Promise<MutationResponse> {
    return await this.exhibitionsService.createExhibition(dto, image, user);
  }

  @Patch('/exhibition')
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Update exhibition' })
  @UseInterceptors(
    FileInterceptor('image', multerOptions(['image/jpg', 'image/jpeg', 'image/png'], 5)),
  )
  async updateExhibition(
    @Body() dto: UpdateExhibitionDto,
    @UploadedFile() image: Express.Multer.File,
    @User() user: IUser,
  ): Promise<MutationResponse> {
    return await this.exhibitionsService.updateExhibition(dto, image, user);
  }
}
