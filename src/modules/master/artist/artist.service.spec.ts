import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AppLoggerService } from 'src/commons/logger';
import { UtilsService } from 'src/commons/utils';
import { MasterArtists } from 'src/datasources/entities';
import { UploadWorkerService } from 'src/workers/upload';

import { ArtistService } from './artist.service';

describe('ArtistService', () => {
  let service: ArtistService;

  let appLoggerService: jest.Mocked<AppLoggerService>;
  let utilsService: jest.Mocked<UtilsService>;
  let uploadWorkerService: jest.Mocked<UploadWorkerService>;

  let artistRepository: jest.Mocked<Repository<MasterArtists>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArtistService,
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
          provide: getRepositoryToken(MasterArtists),
          useValue: {
            findOne: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ArtistService>(ArtistService);

    appLoggerService = module.get(AppLoggerService);
    utilsService = module.get(UtilsService);
    uploadWorkerService = module.get(UploadWorkerService);

    artistRepository = module.get(getRepositoryToken(MasterArtists));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getDetailArtist', () => {
    // TODO: Prepare for unit testing
    void appLoggerService;
    void utilsService;
    void uploadWorkerService;
    void artistRepository;
  });
});
