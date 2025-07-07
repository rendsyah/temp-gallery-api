import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UtilsService } from 'src/commons/utils';
import { MasterBanner } from 'src/datasources/entities';

import { BannerService } from './banner.service';

describe('BannerService', () => {
  let service: BannerService;

  let utilsService: jest.Mocked<UtilsService>;

  let bannerRepository: jest.Mocked<Repository<MasterBanner>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BannerService,
        {
          provide: UtilsService,
          useValue: {
            pagination: jest.fn(),
            paginationResponse: jest.fn(),
            validateUpperCase: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(MasterBanner),
          useValue: {
            findOne: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<BannerService>(BannerService);

    utilsService = module.get(UtilsService);

    bannerRepository = module.get(getRepositoryToken(MasterBanner));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getDetailBanner', () => {
    // TODO: Prepare for unit testing
    void utilsService;
    void bannerRepository;
  });
});
