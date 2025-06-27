import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UtilsService } from 'src/commons/utils';
import { ProductArtists } from 'src/datasources/entities';

import { ArtistService } from './artist.service';

describe('ArtistService', () => {
  let service: ArtistService;

  let utilsService: jest.Mocked<UtilsService>;

  let artistRepository: jest.Mocked<Repository<ProductArtists>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ArtistService,
        {
          provide: UtilsService,
          useValue: {
            pagination: jest.fn(),
            paginationResponse: jest.fn(),
            validateUpperCase: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(ProductArtists),
          useValue: {
            findOne: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ArtistService>(ArtistService);

    utilsService = module.get(UtilsService);

    artistRepository = module.get(getRepositoryToken(ProductArtists));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getDetailArtist', () => {
    console.log(utilsService);
    console.log(artistRepository);
  });
});
