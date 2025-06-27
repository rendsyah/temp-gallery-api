import { BadRequestException, Injectable } from '@nestjs/common';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import dayjs from 'dayjs';
import argon2 from '@node-rs/argon2';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

import { AppConfigService } from '../config';

import {
  IFile,
  IPagination,
  IPaginationResponse,
  IValidateRandomChar,
  IValidateReplacePhone,
  IValidateString,
} from './utils.types';

@Injectable()
export class UtilsService {
  constructor(private readonly appConfigService: AppConfigService) {}

  public validateString(request: string, type: IValidateString): string {
    if (!request) return '';

    switch (type) {
      case 'char':
        return request.replace(/[^a-z\d\s]+/gi, '');

      case 'numeric':
        return request.replace(/[^0-9]/g, '');

      case 'encode':
        return Buffer.from(request).toString('base64');

      case 'decode':
        return Buffer.from(request, 'base64').toString('ascii');

      default:
        return '';
    }
  }

  public validateUpperCase(request: string): string {
    if (!request) return '';

    const splitRequest = request.split(' ');
    const result: string[] = [];

    splitRequest.forEach((value) => {
      result.push(value.charAt(0).toUpperCase() + value.slice(1));
    });

    return result.join(' ');
  }

  public validateSlug(request: string): string {
    return request
      .toLowerCase()
      .trim()
      .replace(/&/g, 'and')
      .replace(/[\s\W-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  public validateReplaceMessage(request: string, variables: string[]): string {
    if (!request) return '';

    variables.forEach((v, i) => {
      request = request.replace(`{{${i + 1}}}`, v);
    });

    return request;
  }

  public validateReplacePhone(request: string, type: IValidateReplacePhone): string {
    if (!request) return '';

    const phonePrefix2Digit = request.substring(0, 2);
    const phonePrefix3Digit = request.substring(0, 3);
    const phoneAfter2Digit = request.slice(2);
    const phoneAfter3Digit = request.slice(3);

    switch (type) {
      case '08':
        if (phonePrefix2Digit === '08') {
          return request;
        }
        return '0' + phoneAfter2Digit;

      case '62':
        if (phonePrefix2Digit === '62') {
          return request;
        }
        return '628' + phoneAfter2Digit;

      case '021':
        if (phonePrefix3Digit === '021') {
          return request;
        }
        return '021' + phoneAfter3Digit;

      default:
        return request;
    }
  }

  public validateRandomChar(request: number, type: IValidateRandomChar): string {
    if (!request) return '';

    let characters = '';
    let charactersResult = '';

    switch (type) {
      case 'alpha':
        characters = 'qwertyuiopasdfghjklzxcvbnm';
        break;

      case 'numeric':
        characters = '1234567890';
        break;

      case 'alphanumeric':
        characters = '1234567890qwertyuiopasdfghjklzxcvbnm';
        break;
    }

    for (let index = 0; index < request; index++) {
      const random = Math.floor(Math.random() * characters.length);
      charactersResult += characters[random].toUpperCase();
    }

    return charactersResult;
  }

  public validateEncrypt(request: string): string {
    const cryptoIv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', this.appConfigService.CRYPTO_SECRET, cryptoIv);
    const encrypted = Buffer.concat([cipher.update(request, 'utf-8'), cipher.final()]);
    const encryptedTag = cipher.getAuthTag();

    const finalResult = Buffer.concat([cryptoIv, encryptedTag, encrypted]).toString('base64url');

    return finalResult;
  }

  public validateDecrypt(request: string): string {
    try {
      const data = Buffer.from(request, 'base64url');
      const cryptoIv = data.subarray(0, 12);
      const encryptedTag = data.subarray(12, 28);
      const encryptedText = data.subarray(28);

      const decipher = createDecipheriv(
        'aes-256-gcm',
        this.appConfigService.CRYPTO_SECRET,
        cryptoIv,
      );

      decipher.setAuthTag(encryptedTag);

      const finalResult = Buffer.concat([
        decipher.update(encryptedText),
        decipher.final(),
      ]).toString();

      return finalResult;
    } catch {
      return '';
    }
  }

  public validateSafeJSON<T>(request: string, fallback: T): T {
    return typeof request === 'string' && request.trim() !== ''
      ? (JSON.parse(request) as T)
      : fallback;
  }

  public validateEndOfMonth(request: Date | string) {
    const requestDate = dayjs(request);
    const nextMonth = requestDate.add(1, 'month');
    const originalDay = requestDate.date();
    const endOfMonth = nextMonth.endOf('month').date();

    const finalDate =
      originalDay > endOfMonth
        ? nextMonth.endOf('month').startOf('day')
        : nextMonth.date(originalDay).startOf('day');

    return finalDate.format('YYYY-MM-DD');
  }

  public async validateHash(request: string): Promise<string> {
    return await argon2.hash(request);
  }

  public async validateCompare(hash: string, request: string): Promise<boolean> {
    return await argon2.verify(hash, request);
  }

  public async validateProcessImage(request: Buffer, dest: string, retries: number): Promise<void> {
    try {
      await sharp(request)
        .resize(800, null, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({ quality: 80 })
        .toFile(dest);
    } catch {
      if (retries > 0) {
        await this.validateProcessImage(request, dest, retries - 1);
      }
    }
  }

  public async validateProcessFile(request: Buffer, dest: string, retries: number): Promise<void> {
    try {
      await fs.promises.writeFile(dest, request);
    } catch {
      if (retries > 0) {
        await this.validateProcessFile(request, dest, retries - 1);
      }
    }
  }

  public validateExtension(mime: string): string {
    const ext: Record<string, string> = {
      'application/pdf': 'pdf',
      'text/plain': 'txt',
      'application/zip': 'zip',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
      'application/msword': 'doc',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
    };

    return ext[mime] ?? 'bin';
  }

  public validateFile(request: Express.Multer.File, config: IFile): string {
    const { type, dest } = config;

    const destpath = path.join(process.cwd(), '..', 'public', dest);

    if (!fs.existsSync(destpath)) {
      fs.mkdirSync(destpath, { recursive: true });
    }

    const extension = type === 'image' ? 'webp' : this.validateExtension(request.mimetype);
    const filename = `${new Date().getTime()}_${this.validateRandomChar(8, 'alphanumeric')}.${extension}`;
    const filepath = path.join(destpath, filename);

    setImmediate(() => {
      if (type === 'image') {
        void this.validateProcessImage(request.buffer, filepath, 3);
      } else {
        void this.validateProcessFile(request.buffer, filepath, 3);
      }
    });

    return '/media' + `${dest}/${filename}`;
  }

  public validateBase64File(request: string, config: IFile): string {
    const { type, dest, mimes = [], maxSize = 5 } = config;

    const base64File = request.match(/^data:(.+);base64,(.+)$/) || [];
    const isValidFile = base64File.length === 3;

    if (!isValidFile) {
      throw new BadRequestException(config.type === 'image' ? 'Invalid image' : 'Invalid file');
    }

    const [, mime, data] = base64File;
    const sizeMB = (data.length * 3) / 4 / 1024 / 1024;

    if (!mimes.includes(mime)) {
      throw new BadRequestException(`Invalid extension, allowed (${mimes.join(', ')})`);
    }

    if (sizeMB > maxSize) {
      throw new BadRequestException(`File too large, max ${maxSize}MB`);
    }

    const buffer = Buffer.from(data, 'base64');
    const destpath = path.join(process.cwd(), '..', 'public', dest);
    const extension = type === 'image' ? 'webp' : this.validateExtension(mime);
    const filename = `${Date.now()}_${this.validateRandomChar(8, 'alphanumeric')}.${extension}`;
    const filepath = path.join(destpath, filename);

    if (!fs.existsSync(destpath)) {
      fs.mkdirSync(destpath, { recursive: true });
    }

    setImmediate(() => {
      if (type === 'image') {
        void this.validateProcessImage(buffer, filepath, 3);
      } else {
        void this.validateProcessFile(buffer, filepath, 3);
      }
    });

    return '/media' + `${dest}/${filename}`;
  }

  public validateMasked(request: string, start: number, end: number): string {
    const splitRequest = request.split(' ');

    const maskRequest = splitRequest.map((req) => {
      const requestLength = req.length;

      if (start + end >= requestLength) {
        return '*'.repeat(requestLength);
      }

      const startMask = req.slice(0, start);
      const midMask = '*'.repeat(requestLength - start - end);
      const endMask = req.slice(requestLength - end);

      return `${startMask}${midMask}${endMask}`;
    });

    return maskRequest.join(' ');
  }

  public pagination(request: IPagination): IPagination {
    const getPage = request.page ? +request.page : 1;
    const getLimit = request.limit ? +request.limit : 10;
    const getStatus = request.status != undefined ? +request.status : undefined;
    const getOrderBy = request.orderBy;
    const getSort = request.sort ? (request.sort as IPagination['sort']) : 'DESC';
    const getSearch = request.search;
    const getStartDate = request.startDate ? dayjs(request.startDate).format('YYYY-MM-DD') : '';
    const getEndDate = request.endDate ? dayjs(request.endDate).format('YYYY-MM-DD') : '';
    const getSkip = (getPage - 1) * getLimit;

    return {
      page: getPage,
      limit: getLimit,
      status: getStatus,
      orderBy: getOrderBy,
      sort: getSort,
      search: getSearch,
      startDate: getStartDate,
      endDate: getEndDate,
      skip: getSkip,
    };
  }

  public paginationInfiniteResponse<T>(request: IPaginationResponse<T>): IPaginationResponse<T> {
    const getItems = request.items.length > 0 ? request.items : [];
    const getLimit = request.meta.limit ? request.meta.limit : 10;
    const getMore = getItems.length >= getLimit;

    const getMeta = {
      getMore: getMore,
    };

    return {
      items: getItems,
      meta: getMeta,
    };
  }

  public paginationResponse<T>(request: IPaginationResponse<T>): IPaginationResponse<T> {
    const getItems = request.items.length > 0 ? request.items : [];
    const getPage = request.meta.page ? request.meta.page : 1;
    const getLimit = request.meta.limit ? request.meta.limit : 10;
    const getTotalData = request.meta.totalData ? request.meta.totalData : 0;
    const getTotalPage = Math.ceil(getTotalData / getLimit);

    const getMeta = {
      page: getPage,
      totalData: getTotalData,
      totalPage: getTotalPage,
      totalPerPage: getLimit,
    };

    return {
      items: getItems,
      meta: getMeta,
    };
  }
}
