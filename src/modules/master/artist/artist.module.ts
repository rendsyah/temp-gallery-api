import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MasterArtists } from 'src/datasources/entities';

import { ArtistController } from './artist.controller';
import { ArtistService } from './artist.service';

@Module({
  imports: [TypeOrmModule.forFeature([MasterArtists])],
  controllers: [ArtistController],
  providers: [ArtistService],
})
export class ArtistModule {}
