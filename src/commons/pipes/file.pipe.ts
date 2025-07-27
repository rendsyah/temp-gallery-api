import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class FilePipe implements PipeTransform {
  transform(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('File / image is required');
    }
    return file;
  }
}
