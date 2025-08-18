import { ICreateSetFlightAPI } from "../../../../utils/interfaces/common/setCommission.interface";

export interface ICreateCommissionSetReqBody {
  name: string;
  api: {
    api_id: number;
    airlines: string[];
    com_domestic: number;
    com_from_dac: number;
    com_to_dac: number;
    com_soto: number;
    com_type: "PER" | "FLAT";
    com_mode: "INCREASE" | "DECREASE";
  }[];
}

export interface IPrePayloadSetCommission extends ICreateSetFlightAPI {
  commissions: ISetSingleCommissionPayload[];
}

export interface ISetSingleCommissionPayload {
  airline: string;
  com_domestic: number;
  com_from_dac: number;
  com_to_dac: number;
  com_soto: number;
  com_type: "PER" | "FLAT";
  com_mode: "INCREASE" | "DECREASE";
  booking_block?: boolean;
  issue_block?: boolean;
}

export interface IUpdateCommissionSetReqBody {
  name?: string;
  add?: number[];
  update?: { id: number; status: boolean }[];
}
