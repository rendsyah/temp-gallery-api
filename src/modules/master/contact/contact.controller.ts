import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

import { JwtAuthGuard } from 'src/commons/guards';
import { IUser, MutationResponse } from 'src/commons/utils/utils.types';
import { User } from 'src/commons/decorators';

import { ContactService } from './contact.service';
import { CreateContactDto, DetailDto, ListContactDto, UpdateContactDto } from './contact.dto';
import { DetailContactResponse, ListContactResponse } from './contact.types';

@ApiTags('Contact')
@UseGuards(JwtAuthGuard)
@Controller({
  path: 'master',
  version: '1',
})
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Get('/contact/detail/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get detail contact' })
  async getDetailContact(@Param() dto: DetailDto): Promise<DetailContactResponse> {
    return await this.contactService.getDetailContact(dto);
  }

  @Get('/contact/list')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get list contact' })
  async getListContact(@Query() dto: ListContactDto): Promise<ListContactResponse> {
    return await this.contactService.getListContact(dto);
  }

  @Post('/contact')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create contact' })
  async createContact(
    @Body() dto: CreateContactDto,
    @User() user: IUser,
  ): Promise<MutationResponse> {
    return await this.contactService.createContact(dto, user);
  }

  @Patch('/contact')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update contact' })
  async updateContact(
    @Body() dto: UpdateContactDto,
    @User() user: IUser,
  ): Promise<MutationResponse> {
    return await this.contactService.updateContact(dto, user);
  }
}
