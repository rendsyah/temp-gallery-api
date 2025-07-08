import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MasterBanner } from 'src/datasources/entities';
import { UploadWorkerModule } from 'src/workers/upload';

import { BannerController } from './banner.controller';
import { BannerService } from './banner.service';

@Module({
  imports: [TypeOrmModule.forFeature([MasterBanner]), UploadWorkerModule],
  controllers: [BannerController],
  providers: [BannerService],
})
export class BannerModule {}
