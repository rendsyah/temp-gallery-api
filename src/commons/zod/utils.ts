type FileMode = 'single' | 'multiple';

export const fileFieldDto = (name: string, mode: FileMode, required: boolean) => ({
  [name]: { mode, required },
});
