import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UtilsService } from 'src/commons/utils';
import { ProductCategory } from 'src/datasources/entities';

import { CategoryService } from './category.service';

describe('CategoryService', () => {
  let service: CategoryService;

  let utilsService: jest.Mocked<UtilsService>;

  let categoryRepository: jest.Mocked<Repository<ProductCategory>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryService,
        {
          provide: UtilsService,
          useValue: {
            pagination: jest.fn(),
            paginationResponse: jest.fn(),
            validateUpperCase: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(ProductCategory),
          useValue: {
            findOne: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CategoryService>(CategoryService);

    utilsService = module.get(UtilsService);

    categoryRepository = module.get(getRepositoryToken(ProductCategory));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getDetailCategory', () => {
    console.log(utilsService);
    console.log(categoryRepository);
  });
});
