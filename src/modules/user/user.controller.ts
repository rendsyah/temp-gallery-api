import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from 'src/commons/guards';
import { IUser, MutationResponse } from 'src/commons/utils/utils.types';
import { User } from 'src/commons/decorators';

import { UserService } from './user.service';
import {
  CreateAccessDto,
  CreateUserDto,
  DetailDto,
  ListAccessDto,
  ListUserDto,
  UpdateAccessDto,
  UpdateUserDto,
} from './user.dto';
import {
  ListUserResponse,
  UserResponse,
  DetailUserResponse,
  AccessOptionsResponse,
  ListAccessResponse,
} from './user.types';

@ApiTags('User')
@UseGuards(JwtAuthGuard)
@Controller({
  path: 'user',
  version: '1',
})
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user' })
  async user(@User() user: IUser): Promise<UserResponse> {
    return await this.userService.user(user);
  }

  @Get('/detail/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get detail user' })
  async getDetailUser(@Param() dto: DetailDto): Promise<DetailUserResponse> {
    return await this.userService.getDetailUser(dto);
  }

  @Get('/list')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get list user' })
  async getListUser(@Query() dto: ListUserDto): Promise<ListUserResponse> {
    return await this.userService.getListUser(dto);
  }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create user' })
  async createUser(@Body() dto: CreateUserDto, @User() user: IUser): Promise<MutationResponse> {
    return await this.userService.createUser(dto, user);
  }

  @Patch()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user' })
  async updateUser(@Body() dto: UpdateUserDto, @User() user: IUser): Promise<MutationResponse> {
    return await this.userService.updateUser(dto, user);
  }

  @Get('/access/options')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get access options' })
  async getAccessOptions(): Promise<AccessOptionsResponse[]> {
    return await this.userService.getAccessOptions();
  }

  @Get('/access/list')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get list access' })
  async getListAccess(@Query() dto: ListAccessDto): Promise<ListAccessResponse> {
    return await this.userService.getListAccess(dto);
  }

  @Post('/access')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create access' })
  async createAccess(@Body() dto: CreateAccessDto, @User() user: IUser): Promise<MutationResponse> {
    return await this.userService.createAccess(dto, user);
  }

  @Patch('/access')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update access' })
  async updateAccess(@Body() dto: UpdateAccessDto, @User() user: IUser): Promise<MutationResponse> {
    return await this.userService.updateAccess(dto, user);
  }
}
