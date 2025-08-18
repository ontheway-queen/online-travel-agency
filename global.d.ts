import { } from "";
import {
  IAdmin,
  IB2BAgencyUser,
  IUser,
} from "./src/features/public/utils/types/commonTypes";
declare global {
  namespace Express {
    interface Request {
      upFiles: string[];
      upFileBase64: Record<string, string | string[]>;
      admin: IAdmin;
      agency: IB2BAgencyUser;
      user: IUser;
    }
  }
}
