import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UtilsService } from 'src/commons/utils';
import { RunnerService } from 'src/datasources/runner';
import { ProductAwards, ProductImages, Products } from 'src/datasources/entities';

import { ProductService } from './product.service';

describe('ProductService', () => {
  let service: ProductService;

  let utilsService: jest.Mocked<UtilsService>;
  let runnerService: jest.Mocked<RunnerService>;

  let productRepository: jest.Mocked<Repository<Products>>;
  let productImageRepository: jest.Mocked<Repository<ProductImages>>;
  let productAwardRepository: jest.Mocked<Repository<ProductAwards>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: UtilsService,
          useValue: {
            pagination: jest.fn(),
            paginationResponse: jest.fn(),
            validateUpperCase: jest.fn(),
          },
        },
        {
          provide: RunnerService,
          useValue: {
            runTransaction: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Products),
          useValue: {
            findOne: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(ProductImages),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(ProductAwards),
          useValue: {
            findOne: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);

    utilsService = module.get(UtilsService);
    runnerService = module.get(RunnerService);

    productRepository = module.get(getRepositoryToken(Products));
    productImageRepository = module.get(getRepositoryToken(ProductImages));
    productAwardRepository = module.get(getRepositoryToken(ProductAwards));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getDetailCategory', () => {
    console.log(utilsService);
    console.log(runnerService);
    console.log(productRepository);
    console.log(productImageRepository);
    console.log(productAwardRepository);
  });
});
