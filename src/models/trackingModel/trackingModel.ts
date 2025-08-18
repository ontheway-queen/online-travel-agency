import { TDB } from "../../features/public/utils/types/commonTypes";
import { ITrackingPayload } from "../../utils/interfaces/admin/trackingInterface";
import Schema from "../../utils/miscellaneous/schema";

export class TrackingModel extends Schema {
  private db: TDB;
  constructor(db: TDB) {
    super();
    this.db = db;
  }

  //Create Tracking
  public async createTraking(payload: ITrackingPayload) {
    return await this.db("tracking_settings")
      .withSchema("services")
      .insert(payload)
      .onConflict("tracking_name")
      .merge();
  }


  //Update Tracking
  public async updateTracking(payload: ITrackingPayload, id: number) {
    return await this.db("tracking_settings")
      .withSchema("services")
      .update(payload)
      .where("id", id);
  }

  //Get Single Tracking
  public async getSingleTracking(id: number) {
    return await this.db<ITrackingPayload>("tracking_settings")
      .withSchema("services")
      .where("id", id)
      .select("tracking_name", "status", "tracking_id_1", "tracking_id_2");
  }

}
