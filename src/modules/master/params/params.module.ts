import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MasterParams } from 'src/datasources/entities';

import { ParamsController } from './params.controller';
import { ParamsService } from './params.service';

@Module({
  imports: [TypeOrmModule.forFeature([MasterParams])],
  controllers: [ParamsController],
  providers: [ParamsService],
})
export class ParamsModule {}
