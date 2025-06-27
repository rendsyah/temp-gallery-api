import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UtilsService } from 'src/commons/utils';
import { MasterParams } from 'src/datasources/entities';

import { ParamsService } from './params.service';

describe('ParamsService', () => {
  let service: ParamsService;

  let utilsService: jest.Mocked<UtilsService>;

  let paramsRepository: jest.Mocked<Repository<MasterParams>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ParamsService,
        {
          provide: UtilsService,
          useValue: {
            pagination: jest.fn(),
            paginationResponse: jest.fn(),
            validateUpperCase: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(MasterParams),
          useValue: {
            findOne: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ParamsService>(ParamsService);

    utilsService = module.get(UtilsService);

    paramsRepository = module.get(getRepositoryToken(MasterParams));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getDetailParams', () => {
    console.log(utilsService);
    console.log(paramsRepository);
  });
});
