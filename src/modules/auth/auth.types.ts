import { IMenu } from 'src/commons/utils/utils.types';

export type SignSessionResponse = {
  access_token: string;
  session_id: string;
};

export type SessionResponse = {
  session: boolean;
};

export type MeResponse = {
  id: number;
  name: string;
  access_name: string;
};

export type MenuResponse = IMenu[];

export type PermissionResponse = {
  id: number;
  path: string;
  actions: Record<string, number>;
};

export type LoginResponse = {
  access_token: string;
  redirect_to: string;
};
