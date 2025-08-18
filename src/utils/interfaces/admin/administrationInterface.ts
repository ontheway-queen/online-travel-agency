export interface IRole {
  name: string;
  created_by?: number;
  agency_id?: number;
  is_main_role?: number;
}

export interface IPermission {
  name: string;
  created_by: number;
}
