import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AppLoggerService } from 'src/commons/logger';
import { UtilsService } from 'src/commons/utils';
import { MasterExhibitions } from 'src/datasources/entities';
import { UploadWorkerService } from 'src/workers/upload';

import { ExhibitionsService } from './exhibitions.service';

describe('ExhibitionsService', () => {
  let service: ExhibitionsService;

  let appLoggerService: jest.Mocked<AppLoggerService>;
  let utilsService: jest.Mocked<UtilsService>;
  let uploadWorkerService: jest.Mocked<UploadWorkerService>;

  let exhibitionRepository: jest.Mocked<Repository<MasterExhibitions>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExhibitionsService,
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
          provide: getRepositoryToken(MasterExhibitions),
          useValue: {
            findOne: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ExhibitionsService>(ExhibitionsService);

    appLoggerService = module.get(AppLoggerService);
    utilsService = module.get(UtilsService);
    uploadWorkerService = module.get(UploadWorkerService);

    exhibitionRepository = module.get(getRepositoryToken(MasterExhibitions));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getDetailArticle', () => {
    // TODO: Prepare for unit testing
    void appLoggerService;
    void utilsService;
    void uploadWorkerService;
    void exhibitionRepository;
  });
});
