import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { getRepositoryToken } from '@nestjs/typeorm';
import { InsertResult, Repository, SelectQueryBuilder, UpdateResult } from 'typeorm';

import { AppConfigService } from 'src/commons/config';
import { UtilsService } from 'src/commons/utils';
import {
  MasterMenu,
  User,
  UserDevice,
  UserPermissions,
  UserSession,
} from 'src/datasources/entities';

import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  let utilsService: jest.Mocked<UtilsService>;
  let jwtService: jest.Mocked<JwtService>;

  let cacheManager: jest.Mocked<Cache>;

  let menuRepository: jest.Mocked<Repository<MasterMenu>>;
  let userRepository: jest.Mocked<Repository<User>>;
  let userPermissionsRepository: jest.Mocked<Repository<UserPermissions>>;
  let userDeviceRepository: jest.Mocked<Repository<UserDevice>>;
  let userSessionRepository: jest.Mocked<Repository<UserSession>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: AppConfigService,
          useValue: {
            JWT_SECRET: 'secret',
            JWT_EXPIRES_IN: '1d',
          },
        },
        {
          provide: UtilsService,
          useValue: {
            validateCompare: jest.fn(),
            validateRandomChar: jest.fn(),
            validatePathToRegex: jest.fn(),
            validateTTLMs: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
          },
        },
        {
          provide: CACHE_MANAGER,
          useValue: {
            get: jest.fn(),
            set: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(MasterMenu),
          useValue: {
            createQueryBuilder: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(UserPermissions),
          useValue: {
            createQueryBuilder: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(UserDevice),
          useValue: {
            findOne: jest.fn(),
            insert: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(UserSession),
          useValue: {
            findOne: jest.fn(),
            insert: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);

    utilsService = module.get(UtilsService);
    jwtService = module.get(JwtService);

    cacheManager = module.get(CACHE_MANAGER);

    menuRepository = module.get(getRepositoryToken(MasterMenu));
    userRepository = module.get(getRepositoryToken(User));
    userDeviceRepository = module.get(getRepositoryToken(UserDevice));
    userPermissionsRepository = module.get(getRepositoryToken(UserPermissions));
    userSessionRepository = module.get(getRepositoryToken(UserSession));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('signSession', () => {
    const mockParams = {
      id: 1,
      name: 'Admin',
      access_name: 'Administrator',
    };

    const mockExpectedResult = {
      access_token: 'token',
      session_id: '1718529600:AB123',
    };

    it('should return session signature data if found', async () => {
      jest.spyOn(Date, 'now').mockReturnValue(1718529600000);

      utilsService.validateRandomChar.mockReturnValue('AB123');
      jwtService.signAsync.mockResolvedValue('token');

      const result = await service.signSession(mockParams);

      expect(result).toEqual(mockExpectedResult);
    });
  });

  describe('session', () => {
    const mockUser = {
      id: 1,
      name: 'Admin',
      access_name: 'Administrator',
      iat: 1000,
      exp: 1000,
    };

    it('should return session: false if no data', async () => {
      userSessionRepository.findOne.mockResolvedValue(null);

      const result = await service.session(mockUser);

      expect(result).toEqual({ session: false });
    });

    it('should return session: false if session sign is > user.iat', async () => {
      userSessionRepository.findOne.mockResolvedValue({
        session_id: '1001:abcde',
      } as unknown as UserSession);

      const result = await service.session(mockUser);

      expect(result).toEqual({ session: false });
    });

    it('should return session: true if session sign is <= user.iat', async () => {
      userSessionRepository.findOne.mockResolvedValue({
        session_id: '999:abcde',
      } as unknown as UserSession);

      const result = await service.session(mockUser);

      expect(result).toEqual({ session: true });
    });
  });

  describe('me', () => {
    const mockUser = {
      id: 1,
      name: 'Admin',
      access_name: 'Administrator',
      iat: 1000,
      exp: 1000,
    };

    const mockExpectedResult = {
      id: 1,
      name: 'Admin',
      access_name: 'Administrator',
    };

    it('should return UnauthorizedException if no data', async () => {
      userSessionRepository.findOne.mockResolvedValue(null);

      await expect(service.me(mockUser)).rejects.toThrow(UnauthorizedException);
    });

    it('should return me data if found', async () => {
      userRepository.findOne.mockResolvedValue({
        id: 1,
      } as unknown as User);

      const result = await service.me(mockUser);

      expect(result).toEqual(mockExpectedResult);
    });
  });

  describe('menu', () => {
    const mockUser = {
      id: 1,
      name: 'Admin',
      access_name: 'Administrator',
      iat: 1000,
      exp: 1000,
    };

    const mockMenuQuery = [
      {
        id: 1,
        name: 'Dashboard',
        path: '/dashboard',
        icon: 'Dashboard',
        level: 1,
        parent_id: 0,
      },
      {
        id: 2,
        name: 'Ecommerce',
        path: '/dashboard/e-commerce',
        icon: 'Ecommerce',
        level: 2,
        parent_id: 1,
      },
    ];

    const mockExpectedResult = [
      {
        id: 1,
        name: 'Dashboard',
        path: '/dashboard',
        icon: 'Dashboard',
        level: 1,
        child: [
          {
            id: 2,
            name: 'Ecommerce',
            path: '/dashboard/e-commerce',
            icon: 'Ecommerce',
            level: 2,
            child: [],
          },
        ],
      },
    ];

    const queryBuilder = (data: unknown[]) => {
      return {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue(data),
      } as unknown as SelectQueryBuilder<MasterMenu>;
    };

    beforeEach(() => {
      const mockMenuQueryBuilder = queryBuilder(mockMenuQuery);
      menuRepository.createQueryBuilder.mockReturnValue(mockMenuQueryBuilder);
    });

    it('should return ForbiddenException if no data', async () => {
      menuRepository.createQueryBuilder.mockReturnValue(queryBuilder([]));

      await expect(service.menu(mockUser)).rejects.toThrow(ForbiddenException);
    });

    it('should return menu data if found', async () => {
      const result = await service.menu(mockUser);

      expect(result).toEqual(mockExpectedResult);
    });
  });

  describe('permission', () => {
    const mockDto = {
      path: '/dashboard',
    };

    const mockUser = {
      id: 1,
      name: 'Admin',
      access_name: 'Administrator',
      iat: 1000,
      exp: 1000,
    };

    const mockExpectedResult = [
      {
        id: 1,
        path: '/dashboard',
        actions: {
          view: 1,
          created: 1,
          updated: 1,
          deleted: 1,
        },
      },
    ];

    const queryBuilder = (data: unknown[]) => {
      return {
        innerJoin: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue(data),
      } as unknown as SelectQueryBuilder<UserPermissions>;
    };

    beforeEach(() => {
      cacheManager.get.mockResolvedValue(mockExpectedResult);

      const mockQueryBuilder = queryBuilder(mockExpectedResult);
      userPermissionsRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      utilsService.validatePathToRegex.mockReturnValue(new RegExp(mockDto.path));
      cacheManager.set.mockResolvedValue(mockExpectedResult);
    });

    it('should return ForbiddenException if no data', async () => {
      cacheManager.get.mockResolvedValue(undefined);
      userPermissionsRepository.createQueryBuilder.mockReturnValue(queryBuilder([]));

      await expect(service.permission(mockDto, mockUser)).rejects.toThrow(ForbiddenException);
    });

    it('should return permission data if cache found', async () => {
      const result = await service.permission(mockDto, mockUser);

      expect(result).toEqual(mockExpectedResult);
    });

    it('should return permission data if found', async () => {
      const result = await service.permission(mockDto, mockUser);

      expect(result).toEqual(mockExpectedResult);
    });
  });

  describe('login', () => {
    const mockDto = {
      user: 'admin',
      password: 'admin',
      device: {
        firebase_id: '',
        device_browser: 'Chrome',
        device_browser_version: '113',
        device_imei: '',
        device_model: 'Macbook Pro',
        device_type: 'laptop',
        device_vendor: 'Apple',
        device_os: 'MacOS',
        device_os_version: '13',
        device_platform: 'Web' as 'Web' | 'Mobile',
        user_agent: 'Mozilla/5.0',
        app_version: '1.0.0',
      },
    };

    const mockUserQuery = {
      id: 1,
      access_id: 1,
      fullname: 'Admin',
      password: 'admin',
      access_name: 'Administrator',
    };

    const mockDirectionQuery = {
      path: '/dashboard',
    };

    const mockSignSession = {
      access_token: 'token',
      session_id: '1234567890',
    };

    const mockExpectedResult = {
      access_token: 'token',
      redirect_to: '/dashboard',
    };

    const userQueryBuilder = (data: unknown) => {
      return {
        innerJoin: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue(data),
      } as unknown as SelectQueryBuilder<User>;
    };

    const directionQueryBuilder = (data: unknown) => {
      return {
        innerJoin: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        addOrderBy: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue(data),
      } as unknown as SelectQueryBuilder<UserPermissions>;
    };

    beforeEach(() => {
      const mockUserQueryBuilder = userQueryBuilder(mockUserQuery);
      userRepository.createQueryBuilder.mockReturnValue(mockUserQueryBuilder);

      const mockDirectionQueryBuilder = directionQueryBuilder(mockDirectionQuery);
      userPermissionsRepository.createQueryBuilder.mockReturnValue(mockDirectionQueryBuilder);

      utilsService.validateCompare.mockResolvedValue(true);
      jest.spyOn(service, 'signSession').mockResolvedValue(mockSignSession);
    });

    it('should return BadRequestException if no data', async () => {
      userRepository.createQueryBuilder.mockReturnValue(userQueryBuilder(null));

      await expect(service.login(mockDto)).rejects.toThrow(BadRequestException);
    });

    it('should return BadRequestException if password is wrong', async () => {
      utilsService.validateCompare.mockResolvedValue(false);

      await expect(service.login(mockDto)).rejects.toThrow(BadRequestException);
    });

    it('should return ForbiddenException if direction not found', async () => {
      userPermissionsRepository.createQueryBuilder.mockReturnValue(directionQueryBuilder(null));

      await expect(service.login(mockDto)).rejects.toThrow(ForbiddenException);
    });

    it('should return login data if found with insert session and device', async () => {
      userSessionRepository.findOne.mockResolvedValue(null);
      userSessionRepository.insert.mockResolvedValue({} as InsertResult);

      userDeviceRepository.findOne.mockResolvedValue(null);
      userDeviceRepository.insert.mockResolvedValue({} as InsertResult);

      const result = await service.login(mockDto);

      expect(result).toEqual(mockExpectedResult);

      expect(service.signSession).toHaveBeenCalledWith({
        id: mockUserQuery.id,
        name: mockUserQuery.fullname,
        access_name: mockUserQuery.access_name,
      });

      expect(userSessionRepository.insert).toHaveBeenCalled();
      expect(userSessionRepository.update).not.toHaveBeenCalled();
      expect(userDeviceRepository.insert).toHaveBeenCalled();
      expect(userDeviceRepository.update).not.toHaveBeenCalled();
    });

    it('should return login data if found with update session and device', async () => {
      userSessionRepository.findOne.mockResolvedValue({
        id: 1,
      } as unknown as UserSession);
      userSessionRepository.update.mockResolvedValue({} as UpdateResult);

      userDeviceRepository.findOne.mockResolvedValue({
        id: 1,
      } as unknown as UserDevice);
      userDeviceRepository.update.mockResolvedValue({} as UpdateResult);

      const result = await service.login(mockDto);

      expect(result).toEqual(mockExpectedResult);

      expect(service.signSession).toHaveBeenCalledWith({
        id: mockUserQuery.id,
        name: mockUserQuery.fullname,
        access_name: mockUserQuery.access_name,
      });

      expect(userSessionRepository.update).toHaveBeenCalled();
      expect(userSessionRepository.insert).not.toHaveBeenCalled();
      expect(userDeviceRepository.update).toHaveBeenCalled();
      expect(userDeviceRepository.insert).not.toHaveBeenCalled();
    });
  });
});
