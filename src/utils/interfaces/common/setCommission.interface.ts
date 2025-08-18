export interface ICreateSetFlightAPI {
  set_id: number;
  api_id: number;
}

export interface ICreateCommissionSetPayload {
  name: string;
  created_by: number;
}

export interface IUpdateSetFlightAPI {
  status: boolean;
}
