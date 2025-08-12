import { IMenu, Nullable } from 'src/commons/utils/utils.types';

export type DetailMenuResponse = Nullable<{
  id: number;
  name: string;
  sort: number;
  status: number;
}>;

export type MenuResponse = IMenu[];
