import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';

import {
  MasterMenu,
  User,
  UserDevice,
  UserPermissions,
  UserSession,
} from 'src/datasources/entities';

import { JwtStrategy } from './jwt.strategy';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [TypeOrmModule.forFeature([MasterMenu, User, UserDevice, UserPermissions, UserSession])],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtService],
})
export class AuthModule {}
