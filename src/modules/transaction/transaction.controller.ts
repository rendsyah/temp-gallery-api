import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from 'src/commons/guards';

import { TransactionService } from './transaction.service';
import { DetailDto, ListTransactionDto } from './transaction.dto';
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
}
