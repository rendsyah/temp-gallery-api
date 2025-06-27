import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MasterMenu } from 'src/datasources/entities';

import { MenuController } from './menu.controller';
import { MenuService } from './menu.service';

@Module({
  imports: [TypeOrmModule.forFeature([MasterMenu])],
  controllers: [MenuController],
  providers: [MenuService],
})
export class MenuModule {}
