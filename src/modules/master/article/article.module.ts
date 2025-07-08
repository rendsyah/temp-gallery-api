import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MasterArticles } from 'src/datasources/entities';
import { UploadWorkerModule } from 'src/workers/upload';

import { ArticleController } from './article.controller';
import { ArticleService } from './article.service';

@Module({
  imports: [TypeOrmModule.forFeature([MasterArticles]), UploadWorkerModule],
  controllers: [ArticleController],
  providers: [ArticleService],
})
export class ArticleModule {}
