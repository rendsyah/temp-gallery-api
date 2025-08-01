import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { MasterMenu } from 'src/datasources/entities';

import { MenuService } from './menu.service';

describe('MenuService', () => {
  let service: MenuService;

  let menuRepository: jest.Mocked<Repository<MasterMenu>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MenuService,
        {
          provide: getRepositoryToken(MasterMenu),
          useValue: {
            createQueryBuilder: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<MenuService>(MenuService);

    menuRepository = module.get(getRepositoryToken(MasterMenu));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getDetailContact', () => {
    // TODO: Prepare for unit testing
    void menuRepository;
  });
});
