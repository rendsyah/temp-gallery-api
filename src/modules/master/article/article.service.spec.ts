import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AppLoggerService } from 'src/commons/logger';
import { UtilsService } from 'src/commons/utils';
import { MasterArticles } from 'src/datasources/entities';
import { UploadWorkerService } from 'src/workers/upload';

import { ArticleService } from './article.service';

describe('ArticleService', () => {
  let service: ArticleService;

  let appLoggerService: jest.Mocked<AppLoggerService>;
  let utilsService: jest.Mocked<UtilsService>;
  let uploadWorkerService: jest.Mocked<UploadWorkerService>;

  let articleRepository: jest.Mocked<Repository<MasterArticles>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArticleService,
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
          provide: getRepositoryToken(MasterArticles),
          useValue: {
            findOne: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ArticleService>(ArticleService);

    appLoggerService = module.get(AppLoggerService);
    utilsService = module.get(UtilsService);
    uploadWorkerService = module.get(UploadWorkerService);

    articleRepository = module.get(getRepositoryToken(MasterArticles));
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
    void articleRepository;
  });
});
