import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AppLoggerService } from 'src/commons/logger';
import { UtilsService } from 'src/commons/utils';
import { RunnerService } from 'src/datasources/runner';
import { ProductImages, Products } from 'src/datasources/entities';
import { UploadWorkerService } from 'src/workers/upload';

import { ProductService } from './product.service';

describe('ProductService', () => {
  let service: ProductService;

  let appLoggerService: jest.Mocked<AppLoggerService>;
  let utilsService: jest.Mocked<UtilsService>;
  let runnerService: jest.Mocked<RunnerService>;
  let uploadWorkerService: jest.Mocked<UploadWorkerService>;

  let productRepository: jest.Mocked<Repository<Products>>;
  let productImageRepository: jest.Mocked<Repository<ProductImages>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
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
          provide: RunnerService,
          useValue: {
            runTransaction: jest.fn(),
          },
        },
        {
          provide: UploadWorkerService,
          useValue: {
            run: jest.fn(),
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
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);

    appLoggerService = module.get(AppLoggerService);
    utilsService = module.get(UtilsService);
    runnerService = module.get(RunnerService);
    uploadWorkerService = module.get(UploadWorkerService);

    productRepository = module.get(getRepositoryToken(Products));
    productImageRepository = module.get(getRepositoryToken(ProductImages));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getDetailCategory', () => {
    // TODO: Prepare for unit testing
    void appLoggerService;
    void utilsService;
    void runnerService;
    void uploadWorkerService;
    void productRepository;
    void productImageRepository;
  });
});
