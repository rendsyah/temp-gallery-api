import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Transactions } from 'src/datasources/entities';

import { ProductModule } from '../product/product.module';

import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';

@Module({
  imports: [TypeOrmModule.forFeature([Transactions]), ProductModule],
  controllers: [TransactionController],
  providers: [TransactionService],
})
export class TransactionModule {}
