import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UtilsService } from 'src/commons/utils';
import { IUser, MutationResponse } from 'src/commons/utils/utils.types';
import { MasterContacts } from 'src/datasources/entities';

import { CreateContactDto, DetailDto, ListContactDto, UpdateContactDto } from './contact.dto';
import { DetailContactResponse, ListContactResponse } from './contact.types';

@Injectable()
export class ContactService {
  constructor(
    private readonly utilsService: UtilsService,

    @InjectRepository(MasterContacts)
    private readonly ContactRepository: Repository<MasterContacts>,
  ) {}

  /**
   * Handle get detail contact service
   * @param dto
   * @returns
   */
  async getDetailContact(dto: DetailDto): Promise<DetailContactResponse> {
    const getContact = await this.ContactRepository.createQueryBuilder('contact')
      .select([
        'contact.id AS id',
        'contact.name AS name',
        'contact.email AS email',
        'contact.phone AS phone',
        'contact.wa_phone AS wa_phone',
        'contact.location AS location',
        'contact.lat AS lat',
        'contact.lng AS lng',
        'contact.status AS status',
      ])
      .where('contact.id = :id', { id: dto.id })
      .getRawOne();

    if (!getContact) {
      throw new NotFoundException('Contact not found');
    }

    return {
      id: getContact.id,
      name: getContact.name,
      email: getContact.email,
      phone: getContact.phone,
      wa_phone: getContact.wa_phone,
      location: getContact.location,
      lat: getContact.lat,
      lng: getContact.lng,
      status: getContact.status,
    };
  }

  /**
   * Handle get list contact service
   * @param dto
   * @returns
   */
  async getListContact(dto: ListContactDto): Promise<ListContactResponse> {
    const pagination = this.utilsService.pagination(dto);
    const {
      page,
      limit,
      skip,
      status,
      orderBy = 'contact.id',
      sort = 'DESC',
      search,
      startDate,
      endDate,
    } = pagination;

    const baseQuery = this.ContactRepository.createQueryBuilder('contact');

    if (search) {
      baseQuery.andWhere('contact.name ILIKE :search', { search: `%${search}%` });
    }

    if (status !== undefined) {
      baseQuery.andWhere('contact.status = :status', { status: status });
    }

    if (startDate && endDate) {
      baseQuery.andWhere('DATE(contact.created_at) BETWEEN :start_date AND :end_date', {
        start_date: startDate,
        end_date: endDate,
      });
    }

    const countQuery = baseQuery.clone();
    const itemsQuery = baseQuery
      .select([
        'contact.id AS id',
        'contact.name AS name',
        'contact.email AS email',
        'contact.phone AS phone',
        'contact.wa_phone AS wa_phone',
        'contact.status AS status',
        `CASE
          WHEN contact.status = 1 THEN 'Active'
          ELSE 'Inactive'
         END AS status_text`,
        'contact.created_at AS created_at',
        'contact.updated_at AS updated_at',
      ])
      .orderBy(orderBy, sort)
      .limit(limit)
      .offset(skip)
      .getRawMany();

    const [items, totalData] = await Promise.all([itemsQuery, countQuery.getCount()]);

    return this.utilsService.paginationResponse({
      items,
      meta: {
        page,
        limit,
        totalData,
      },
    });
  }

  /**
   * Handle create contact service
   * @param dto
   * @param user
   * @returns
   */
  async createContact(dto: CreateContactDto, user: IUser): Promise<MutationResponse> {
    const formatName = this.utilsService.validateUpperCase(dto.name);
    const formatPhone = this.utilsService.validateReplacePhone(dto.phone, '021');
    const formatWaPhone = this.utilsService.validateReplacePhone(dto.wa_phone, '08');

    await this.ContactRepository.insert({
      name: formatName,
      email: dto.email,
      phone: formatPhone,
      wa_phone: formatWaPhone,
      location: dto.location,
      lat: dto.lat,
      lng: dto.lng,
      created_by: user.id,
    });

    return {
      success: true,
      message: 'Successfully created',
    };
  }

  /**
   * Handle update contact service
   * @param dto
   * @param user
   * @returns
   */
  async updateContact(dto: UpdateContactDto, user: IUser): Promise<MutationResponse> {
    const getContact = await this.ContactRepository.findOne({
      where: {
        id: dto.id,
      },
      select: ['id'],
    });

    if (!getContact) {
      throw new NotFoundException('Contact not found');
    }

    const formatName = this.utilsService.validateUpperCase(dto.name);
    const formatPhone = this.utilsService.validateReplacePhone(dto.phone, '021');
    const formatWaPhone = this.utilsService.validateReplacePhone(dto.wa_phone, '08');

    await this.ContactRepository.update(
      {
        id: dto.id,
      },
      {
        name: formatName,
        email: dto.email,
        phone: formatPhone,
        wa_phone: formatWaPhone,
        location: dto.location,
        lat: dto.lat,
        lng: dto.lng,
        status: dto.status,
        updated_by: user.id,
      },
    );

    return {
      success: true,
      message: 'Successfully updated',
    };
  }
}
