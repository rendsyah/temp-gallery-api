import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UtilsService } from 'src/commons/utils';
import { ProductThemes } from 'src/datasources/entities';

import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  let service: ThemeService;

  let utilsService: jest.Mocked<UtilsService>;

  let themeRepository: jest.Mocked<Repository<ProductThemes>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ThemeService,
        {
          provide: UtilsService,
          useValue: {
            pagination: jest.fn(),
            paginationResponse: jest.fn(),
            validateUpperCase: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(ProductThemes),
          useValue: {
            findOne: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ThemeService>(ThemeService);

    utilsService = module.get(UtilsService);

    themeRepository = module.get(getRepositoryToken(ProductThemes));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getDetailTheme', () => {
    // TODO: Prepare for unit testing
    void utilsService;
    void themeRepository;
  });
});
