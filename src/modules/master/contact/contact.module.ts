import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MasterContacts } from 'src/datasources/entities';

import { ContactController } from './contact.controller';
import { ContactService } from './contact.service';

@Module({
  imports: [TypeOrmModule.forFeature([MasterContacts])],
  controllers: [ContactController],
  providers: [ContactService],
})
export class ContactModule {}
