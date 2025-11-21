export interface Usuario {
  id?: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  photo?: File | string;
  photo_url?: string;
  groups?: any[];
  group_ids?: number[];
  password?: string;
}
