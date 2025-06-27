import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from 'src/commons/guards';
import { IUser } from 'src/commons/utils/utils.types';
import { User } from 'src/commons/decorators';

import { ArticleService } from './article.service';
import { CreateArticleDto, DetailDto, ListArticleDto, UpdateArticleDto } from './article.dto';
import {
  CreateArticleResponse,
  DetailArticleResponse,
  ListArticleResponse,
  UpdateArticleResponse,
} from './article.types';

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
  @ApiOperation({ summary: 'Create article' })
  async createArticle(
    @Body() dto: CreateArticleDto,
    @User() user: IUser,
  ): Promise<CreateArticleResponse> {
    return await this.articleService.createArticle(dto, user);
  }

  @Patch('/article')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update article' })
  async updateArticle(
    @Body() dto: UpdateArticleDto,
    @User() user: IUser,
  ): Promise<UpdateArticleResponse> {
    return await this.articleService.updateArticle(dto, user);
  }
}
