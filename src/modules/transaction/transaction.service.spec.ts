import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UtilsService } from 'src/commons/utils';
import { RunnerService } from 'src/datasources/runner';
import { Transactions } from 'src/datasources/entities';

import { ProductService } from '../product/product.service';
import { TransactionService } from './transaction.service';

describe('TransactionService', () => {
  let service: TransactionService;

  let utilsService: jest.Mocked<UtilsService>;
  let runnerService: jest.Mocked<RunnerService>;
  let productService: jest.Mocked<ProductService>;

  let transactionRepository: jest.Mocked<Repository<Transactions>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionService,
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
          provide: ProductService,
          useValue: {
            getDetailProduct: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Transactions),
          useValue: {
            findOne: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<TransactionService>(TransactionService);

    utilsService = module.get(UtilsService);
    runnerService = module.get(RunnerService);
    productService = module.get(ProductService);

    transactionRepository = module.get(getRepositoryToken(Transactions));
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
    console.log(productService);
    console.log(transactionRepository);
  });
});
