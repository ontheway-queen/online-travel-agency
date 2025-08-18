import { TDB } from "../../features/public/utils/types/commonTypes";
import { IAnnouncementBarPayload } from "../../utils/interfaces/common/commonInterface";
import Schema from "../../utils/miscellaneous/schema";

export class AnnouncementBarModel extends Schema {
  private db: TDB;

  constructor(db: TDB) {
    super();
    this.db = db;
  }

  //create announcement
  async createAnnouncementBar(payload: IAnnouncementBarPayload) {
    return await this.db("website_announcement_bar")
      .withSchema(this.SERVICE_SCHEMA)
      .insert(payload, "id");
  }

  //get all announcement
  async getAllAnnouncementBar({
    isActive,
    currentDate,
    type,
  }: {
    isActive: boolean;
    currentDate?: Date;
    type?: "B2B" | "B2C";
  }) {
    return await this.db("website_announcement_bar")
      .withSchema(this.SERVICE_SCHEMA)
      .select(
        "id",
        "message",
        "start_date",
        "end_date",
        "link",
        "is_active",
        "type"
      )
      .where((qb) => {
        if (isActive != undefined) {
          qb.andWhere("is_active", isActive);
        }
        if (currentDate) {
          qb.andWhere("start_date", "<=", currentDate)
            .andWhere(function () {
              this.whereNull("end_date").orWhere("end_date", ">=", currentDate);
            });
        }
        if (type) {
          qb.andWhere("type", type);
        }
      })
      .orderBy("id", "desc");
  }

  //get single announcement
  async getSingeAnnouncementBar(id: number) {
    return await this.db("website_announcement_bar")
      .withSchema(this.SERVICE_SCHEMA)
      .where({ id })
      .first();
  }

  //update announcement
  async updateAnnouncementBar(payload: IAnnouncementBarPayload, id: number) {
    return await this.db("website_announcement_bar")
      .withSchema(this.SERVICE_SCHEMA)
      .update(payload)
      .where({ id });
  }

  //delete announcement
  async deleteAnnouncementBar(id: number) {
    return await this.db("website_announcement_bar")
      .withSchema(this.SERVICE_SCHEMA)
      .del()
      .where({ id });
  }
}
