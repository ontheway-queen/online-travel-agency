export interface IUpdateProfilePayload {
  username?: string;
  name?: string;
  gender?: string;
  email?: string;
  password_hash?: string;
  phone_number?: string;
  photo?: string;
  role_id?: number;
  status?: boolean;
  twoFA?: string;
}

export interface IAdminSearchQuery {
  email?: string;
  id?: number;
  phone_number?: string;
  username?: string;
}

export interface IAdminCreatePayload {
  username: string;
  name: string;
  gender: 'Male' | 'Female' | 'Other';
  email: string;
  password_hash: string;
  phone_number: string;
  photo?: string;
  role_id: number;
  created_by: number;
  twoFA?: string;
}

export interface IGetAdminListFilterQuery {
  filter?: string;
  role?: number;
  limit?: number;
  skip?: number;
  status?: string;
}
