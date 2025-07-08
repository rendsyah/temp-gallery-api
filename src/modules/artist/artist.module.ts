import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProductArtists } from 'src/datasources/entities';
import { UploadWorkerModule } from 'src/workers/upload';

import { ArtistController } from './artist.controller';
import { ArtistService } from './artist.service';

@Module({
  imports: [TypeOrmModule.forFeature([ProductArtists]), UploadWorkerModule],
  controllers: [ArtistController],
  providers: [ArtistService],
})
export class ArtistModule {}
