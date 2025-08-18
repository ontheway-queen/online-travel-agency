import { Knex } from "knex";
import AbstractServices from "../../../../abstract/abstract.service";
import { io } from "../../../../app/socket";
import { InsertNotificationPayload } from "../../../../utils/interfaces/admin/notification.interface";

export class AdminNotificationSubService extends AbstractServices {
  private trx: Knex.Transaction;
  constructor(trx?: Knex.Transaction) {
    super();
    this.trx = trx || ({} as Knex.Transaction);
  }
  //insert notification
  public async insertNotification(payload: InsertNotificationPayload) {
    const notificationModel = this.Model.adminNotificationModel(this.trx);
    //insert notification to database
    const res = await notificationModel.insertNotification(payload);

    //send notification to socket
    const getAdminInfo = await this.Model.adminModel(this.trx).getAllAdmin({
      limit: 9999999,
    });
    const admin_socket_ids =
      getAdminInfo?.data?.map((socket_ids) => socket_ids.socket_id) || [];
    io.to(admin_socket_ids).emit("notification", {
      id: res[0].id,
      message: payload.message,
      type: payload.type,
      ref_id: payload.ref_id,
      created_at: new Date(),
      read: false,
    });
  }
}
