export interface ISpecialOfferPayload {
  type: string;
  title: string;
  description: string;
  photo: string;
  createdBy: number;
  status: "ACTIVE" | "INACTIVE";
}

export interface ISpecialOfferParams {
  id?: number;
  type?: string;
  title?: string;
  description?: string;
  photo?: string;
  createdBy?: number;
  created_at?: Date;
  limit?: number;
  skip?: number;
  key?: string;
  status?: string;
  panel?: string | string[];
}
