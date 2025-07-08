import fs from 'fs';
import sharp from 'sharp';

import { logger } from 'src/commons/logger';

import { sleep } from '../utils';
import { UploadWorkerRequest, UploadWorkerTask, WorkerProcessing } from './upload.worker.types';

const imageProcessing = async (data: WorkerProcessing) => {
  const {
    context,
    buffer,
    original_name,
    filename,
    dest,
    retries = 3,
    maxRetries = 3,
    backoffMs = 1000,
  } = data;

  const attempt = maxRetries + 1 - retries;

  const req = {
    context,
    original_name,
    filename,
    dest,
    attempt,
    retries,
    maxRetries,
    backoffMs,
  };

  const startTime = Date.now();

  try {
    await sharp(buffer)
      .resize(800, null, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: 80 })
      .toFile(dest);

    logger.info('Image processing success', {
      labels: { service: 'upload-worker-service' },
      req,
      res: {
        success: true,
        resize: true,
        filename,
      },
      responseTime: Date.now() - startTime,
    });
  } catch (err) {
    const stack = {
      name: err?.name ?? 'UnknownError',
      message: err?.message ?? JSON.stringify(err),
      stack: err?.stack ?? '',
    };

    logger.warn(`Retrying image processing... attempt ${attempt} of ${maxRetries}`, {
      labels: { service: 'upload-worker-service' },
      req,
      stack,
    });

    if (retries > 0) {
      await sleep(backoffMs);
      await imageProcessing({
        context,
        buffer,
        original_name,
        filename,
        dest,
        retries: retries - 1,
        maxRetries,
        backoffMs,
      });
    } else {
      logger.error('Image processing failed', {
        labels: { service: 'upload-worker-service' },
        req,
        stack,
        responseTime: Date.now() - startTime,
      });
      throw err;
    }
  }
};

const fileProcessing = async (data: WorkerProcessing) => {
  const {
    context,
    buffer,
    original_name,
    filename,
    dest,
    retries = 3,
    maxRetries = 3,
    backoffMs = 1000,
  } = data;

  const attempt = maxRetries + 1 - retries;

  const req = {
    context,
    original_name,
    filename,
    dest,
    attempt,
    retries,
    maxRetries,
    backoffMs,
  };

  const startTime = Date.now();

  try {
    await fs.promises.writeFile(dest, buffer);

    logger.info('File processing success', {
      labels: { service: 'upload-worker-service' },
      req,
      res: {
        success: true,
        filename,
      },
      responseTime: Date.now() - startTime,
    });
  } catch (err) {
    const stack = {
      name: err?.name ?? 'UnknownError',
      message: err?.message ?? JSON.stringify(err),
      stack: err?.stack ?? '',
    };

    logger.warn(`Retrying file processing... attempt ${attempt} of ${maxRetries}`, {
      labels: { service: 'upload-worker-service' },
      req,
      stack,
    });

    if (retries > 0) {
      await sleep(1000);
      await fileProcessing({
        context,
        buffer,
        original_name,
        filename,
        dest,
        retries: retries - 1,
        maxRetries,
        backoffMs,
      });
    } else {
      logger.error('File processing failed', {
        labels: { service: 'upload-worker-service' },
        req,
        stack,
        responseTime: Date.now() - startTime,
      });
      throw err;
    }
  }
};

const tasks: UploadWorkerTask = {
  'image.processing': imageProcessing,
  'file.processing': fileProcessing,
};

export default async (input: UploadWorkerRequest) => {
  const task = tasks[input.task];

  if (!task) {
    throw new Error('Invalid task');
  }

  return task(input.data);
};
