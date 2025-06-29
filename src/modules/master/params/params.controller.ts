import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from 'src/commons/guards';
import { IUser, MutationResponse } from 'src/commons/utils/utils.types';
import { User } from 'src/commons/decorators';

import { ParamsService } from './params.service';
import { CreateParamsDto, DetailDto, ListParamsDto, UpdateParamsDto } from './params.dto';
import { DetailParamsResponse, ListParamsResponse } from './params.types';

@ApiTags('Params')
@UseGuards(JwtAuthGuard)
@Controller({
  path: 'master',
  version: '1',
})
export class ParamsController {
  constructor(private readonly paramsService: ParamsService) {}

  @Get('/params/detail/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get detail params' })
  async getDetailParams(@Param() dto: DetailDto): Promise<DetailParamsResponse> {
    return await this.paramsService.getDetailParams(dto);
  }

  @Get('/params/list')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get list params' })
  async getListParams(@Query() dto: ListParamsDto): Promise<ListParamsResponse> {
    return await this.paramsService.getListParams(dto);
  }

  @Post('/params')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create params' })
  async createParams(@Body() dto: CreateParamsDto, @User() user: IUser): Promise<MutationResponse> {
    return await this.paramsService.createParams(dto, user);
  }

  @Patch('/params')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update params' })
  async updateParams(@Body() dto: UpdateParamsDto, @User() user: IUser): Promise<MutationResponse> {
    return await this.paramsService.updateParams(dto, user);
  }
}
