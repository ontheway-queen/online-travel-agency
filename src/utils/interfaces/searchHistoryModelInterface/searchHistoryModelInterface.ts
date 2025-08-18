import { IFlightSearchReqBody } from "../flight/flightSearchInterface";

export interface ICreateFlightSearchHistoryPayload {
  user_type: "Agent" | "User";
  agency_id?: number;
  searched_by?: number;
  journey_type: "One Way" | "Round Trip" | "Multi City";
  flight_class: "Economy" | "First Class" | "Business" | "Premium Economy";
  total_adult: number;
  total_child?: number;
  total_infant?: number;
  route: string;
  journey_date: string;
  preferred_airlines?: string;
  request_body: IFlightSearchReqBody;
}

export interface IGetFlightSearchHistoryFilterQuery {
  user_type?: string;
  agency_id?: number;
  from_date?: Date;
  to_date?: Date;
  limit?: number;
  skip?: number;
  type?: string;
}

export interface IFlightSearchHistory {
  user_type: "Agent" | "User";
  agency_id: number | null;
  agency_name: string | null;
  searched_by: string;
  searched_at: Date;
  journey_type: "One Way" | "Round Trip" | "Multi City";
  flight_class: "Economy" | "First Class" | "Business" | "Premium Economy";
  total_adult: number;
  total_child: number;
  total_infant: number;
  route: string;
  journey_date: string;
  preferred_airlines: string;
}
