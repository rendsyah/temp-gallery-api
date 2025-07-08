// workers/Upload/Upload.worker.service.ts
import { Injectable } from '@nestjs/common';
import { Piscina } from 'piscina';
import path from 'path';

import { AppConfigService } from 'src/commons/config';

import { UploadWorkerRequest, UploadWorkerTaskMap } from './upload.worker.types';

@Injectable()
export class UploadWorkerService {
  private pool: Piscina;

  constructor(private readonly appConfigService: AppConfigService) {
    this.pool = new Piscina({
      filename: path.resolve(__dirname, './upload.worker.js'),
      maxThreads: this.appConfigService.WORKER_THREADS,
    });
  }

  /**
   * Handle status upload worker service
   * @returns
   */
  status() {
    return {
      queueSize: this.pool.queueSize,
      completed: this.pool.completed,
    };
  }

  /**
   * Handle run upload worker service
   * @param request
   * @returns
   */
  run<T extends keyof UploadWorkerTaskMap>(request: UploadWorkerRequest<T>) {
    return this.pool.run(request);
  }
}
