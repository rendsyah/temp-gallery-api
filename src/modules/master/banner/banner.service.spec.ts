import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AppLoggerService } from 'src/commons/logger';
import { UtilsService } from 'src/commons/utils';
import { MasterBanner } from 'src/datasources/entities';
import { UploadWorkerService } from 'src/workers/upload';

import { BannerService } from './banner.service';

describe('BannerService', () => {
  let service: BannerService;

  let appLoggerService: jest.Mocked<AppLoggerService>;
  let utilsService: jest.Mocked<UtilsService>;
  let uploadWorkerService: jest.Mocked<UploadWorkerService>;

  let bannerRepository: jest.Mocked<Repository<MasterBanner>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BannerService,
        {
          provide: AppLoggerService,
          useValue: {
            addMeta: jest.fn(),
          },
        },
        {
          provide: UtilsService,
          useValue: {
            pagination: jest.fn(),
            paginationResponse: jest.fn(),
            validateUpperCase: jest.fn(),
          },
        },
        {
          provide: UploadWorkerService,
          useValue: {
            run: jest.fn(),
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

    appLoggerService = module.get(AppLoggerService);
    utilsService = module.get(UtilsService);
    uploadWorkerService = module.get(UploadWorkerService);

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
    void appLoggerService;
    void utilsService;
    void uploadWorkerService;
    void bannerRepository;
  });
});
