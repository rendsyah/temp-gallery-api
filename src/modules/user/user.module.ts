import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { User, UserAccess, UserPermissions } from 'src/datasources/entities';

import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserAccess, UserPermissions])],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
