import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MasterBanner } from 'src/datasources/entities';

import { BannerController } from './banner.controller';
import { BannerService } from './banner.service';

@Module({
  imports: [TypeOrmModule.forFeature([MasterBanner])],
  controllers: [BannerController],
  providers: [BannerService],
})
export class BannerModule {}
