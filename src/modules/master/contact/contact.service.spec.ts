import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UtilsService } from 'src/commons/utils';
import { MasterContact } from 'src/datasources/entities';

import { ContactService } from './contact.service';

describe('ContactService', () => {
  let service: ContactService;

  let utilsService: jest.Mocked<UtilsService>;

  let contactRepository: jest.Mocked<Repository<MasterContact>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContactService,
        {
          provide: UtilsService,
          useValue: {
            pagination: jest.fn(),
            paginationResponse: jest.fn(),
            validateUpperCase: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(MasterContact),
          useValue: {
            findOne: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ContactService>(ContactService);

    utilsService = module.get(UtilsService);

    contactRepository = module.get(getRepositoryToken(MasterContact));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getDetailContact', () => {
    console.log(utilsService);
    console.log(contactRepository);
  });
});
