export type UploadWorkerTaskMap = {
  'image.processing': WorkerProcessing;
  'file.processing': WorkerProcessing;
};

export type UploadWorkerTask = {
  [K in keyof UploadWorkerTaskMap]: (data: UploadWorkerTaskMap[K]) => Promise<void>;
};

export type UploadWorkerRequest<T extends keyof UploadWorkerTaskMap = keyof UploadWorkerTaskMap> = {
  task: T;
  data: UploadWorkerTaskMap[T];
};

export type WorkerProcessing = {
  context: string;
  buffer: Buffer;
  original_name: string;
  filename: string;
  dest: string;

  // current attempt count
  retries?: number;

  // constant max retries allowed (immutable once passed)
  maxRetries?: number;

  // optional delay between retries in milliseconds
  backoffMs?: number;
};
