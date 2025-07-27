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

import { ArticleService } from './article.service';
import { CreateArticleDto, DetailDto, ListArticleDto, UpdateArticleDto } from './article.dto';
import { DetailArticleResponse, ListArticleResponse } from './article.types';

@ApiTags('Article')
@UseGuards(JwtAuthGuard)
@Controller({
  path: 'master',
  version: '1',
})
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Get('/article/detail/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get detail article' })
  async getDetailArticle(@Param() dto: DetailDto): Promise<DetailArticleResponse> {
    return await this.articleService.getDetailArticle(dto);
  }

  @Get('/article/list')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get list article' })
  async getListArticle(@Query() dto: ListArticleDto): Promise<ListArticleResponse> {
    return await this.articleService.getListArticle(dto);
  }

  @Post('/article')
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Create article' })
  @UseInterceptors(
    FileInterceptor('image', multerOptions(['image/jpg', 'image/jpeg', 'image/png'], 5)),
  )
  async createArticle(
    @Body() dto: CreateArticleDto,
    @UploadedFile(FilePipe) image: Express.Multer.File,
    @User() user: IUser,
  ): Promise<MutationResponse> {
    return await this.articleService.createArticle(dto, image, user);
  }

  @Patch('/article')
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Update article' })
  @UseInterceptors(
    FileInterceptor('image', multerOptions(['image/jpg', 'image/jpeg', 'image/png'], 5)),
  )
  async updateArticle(
    @Body() dto: UpdateArticleDto,
    @UploadedFile(FilePipe) image: Express.Multer.File,
    @User()
    user: IUser,
  ): Promise<MutationResponse> {
    return await this.articleService.updateArticle(dto, image, user);
  }
}
