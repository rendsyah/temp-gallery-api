import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UtilsService } from 'src/commons/utils';
import { ProductSubCategory } from 'src/datasources/entities';

import { SubCategoryService } from './sub_category.service';

describe('SubCategoryService', () => {
  let service: SubCategoryService;

  let utilsService: jest.Mocked<UtilsService>;

  let subCategoryRepository: jest.Mocked<Repository<ProductSubCategory>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SubCategoryService,
        {
          provide: UtilsService,
          useValue: {
            pagination: jest.fn(),
            paginationResponse: jest.fn(),
            validateUpperCase: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(ProductSubCategory),
          useValue: {
            findOne: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SubCategoryService>(SubCategoryService);

    utilsService = module.get(UtilsService);

    subCategoryRepository = module.get(getRepositoryToken(ProductSubCategory));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getDetailArtist', () => {
    console.log(utilsService);
    console.log(subCategoryRepository);
  });
});
