import { Knex } from "knex";
import AbstractServices from "../../../../abstract/abstract.service";
import { io } from "../../../../app/socket";
import { InsertNotificationPayload } from "../../../../utils/interfaces/agent/agency.notification.interface";

export class AgencyNotificationSubService extends AbstractServices {

    private trx: Knex.Transaction
    constructor(trx: Knex.Transaction){
        super();
        this.trx = trx;
    }
    //insert notification
    public async insertNotification(payload: InsertNotificationPayload) {
        const notificationModel = this.Model.agencyNotificationModel(this.trx);
        //insert notification to database
        const res = await notificationModel.insertNotification(payload);

        //send notification to socket
        const getAgentsInfo = await this.Model.agencyModel(this.trx).getUser({ agency_id: payload.agency_id, limit: 9999999 });
        const agent_socket_ids = getAgentsInfo?.map((socket_ids) => socket_ids.socket_id) || [];
        io.to(agent_socket_ids).emit('notification', {
            id: res[0].id,
            message: payload.message,
            type: payload.type,
            ref_id: payload.ref_id,
            created_at: new Date(),
            read: false
        });
    }
}