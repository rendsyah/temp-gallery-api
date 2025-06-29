import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from 'src/commons/guards';
import { IUser, MutationResponse } from 'src/commons/utils/utils.types';
import { User } from 'src/commons/decorators';

import { TransactionService } from './transaction.service';
import { CreateTransactionDto, DetailDto, ListTransactionDto } from './transaction.dto';
import { DetailTransactionResponse, ListTransactionResponse } from './transaction.types';

@ApiTags('Transaction')
@UseGuards(JwtAuthGuard)
@Controller({
  path: 'transaction',
  version: '1',
})
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @Get('/detail/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get detail transaction' })
  async getDetailTransaction(@Param() dto: DetailDto): Promise<DetailTransactionResponse> {
    return await this.transactionService.getDetailTransaction(dto);
  }

  @Get('/list')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get list transaction' })
  async getListTransaction(@Query() dto: ListTransactionDto): Promise<ListTransactionResponse> {
    return await this.transactionService.getListTransaction(dto);
  }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create transaction' })
  async createTransaction(
    @Body() dto: CreateTransactionDto,
    @User() user: IUser,
  ): Promise<MutationResponse> {
    return await this.transactionService.createTransaction(dto, user);
  }
}
