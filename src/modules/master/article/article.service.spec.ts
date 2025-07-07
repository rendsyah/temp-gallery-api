import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UtilsService } from 'src/commons/utils';
import { MasterArticles } from 'src/datasources/entities';

import { ArticleService } from './article.service';

describe('ArticleService', () => {
  let service: ArticleService;

  let utilsService: jest.Mocked<UtilsService>;

  let articleRepository: jest.Mocked<Repository<MasterArticles>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArticleService,
        {
          provide: UtilsService,
          useValue: {
            pagination: jest.fn(),
            paginationResponse: jest.fn(),
            validateUpperCase: jest.fn(),
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

    utilsService = module.get(UtilsService);

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
    void utilsService;
    void articleRepository;
  });
});
