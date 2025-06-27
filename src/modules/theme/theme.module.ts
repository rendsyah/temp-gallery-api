import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProductThemes } from 'src/datasources/entities';

import { ThemeController } from './theme.controller';
import { ThemeService } from './theme.service';

@Module({
  imports: [TypeOrmModule.forFeature([ProductThemes])],
  controllers: [ThemeController],
  providers: [ThemeService],
})
export class ThemeModule {}
