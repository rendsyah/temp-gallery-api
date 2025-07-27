import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class FilePipe implements PipeTransform {
  transform(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    return file;
  }
}

@Injectable()
export class FilesPipe implements PipeTransform {
  transform(files: Express.Multer.File[]) {
    if (!files || !Array.isArray(files) || files.length === 0) {
      throw new BadRequestException('File(s) is required');
    }
    return files;
  }
}
