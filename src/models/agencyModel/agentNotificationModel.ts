import { TDB } from '../../features/public/utils/types/commonTypes';
import { InsertNotificationPayload, InsertNotificationSeenPayload } from '../../utils/interfaces/agent/agency.notification.interface';
import Schema from '../../utils/miscellaneous/schema';

export class AgencyNotificationModel extends Schema {
    private db: TDB;
    constructor(db: TDB) {
        super();
        this.db = db;
    }

    //insert notification
    public async insertNotification(payload: InsertNotificationPayload) {
        return await this.db("notification")
            .withSchema(this.AGENT_SCHEMA)
            .insert(payload, 'id')
    }

    //get notifications
    public async getNotifications(payload: { agency_id: number, limit?: number, skip?: number, user_id?: number }) {
        const data = await this.db("notification as nn")
            .withSchema(this.AGENT_SCHEMA)
            .select(
                "nn.id",
                "nn.message",
                "nn.type",
                "nn.ref_id",
                "nn.created_at",
                this.db.raw("CASE WHEN ns.notification_id IS NOT NULL THEN true ELSE false END as read")
            )
            .leftJoin("notification_seen as ns", (join) => {
                join.on("ns.notification_id", "nn.id").andOn("ns.user_id", this.db.raw("?", [payload.user_id]));
            })
            .orderBy("nn.id", "desc")
            .limit(payload.limit || 20)
            .offset(payload.skip || 0)
            .where("nn.agency_id", payload.agency_id);

        const total = await this.db("notification")
            .withSchema(this.AGENT_SCHEMA)
            .count("id as total")
            .where("agency_id", payload.agency_id);

        return { data, total: total?.[0]?.total }
    }

    //insert notification seen 
    public async insertNotificationSeen(payload: InsertNotificationSeenPayload) {
        return await this.db("notification_seen")
            .withSchema(this.AGENT_SCHEMA)
            .insert(payload)
    }

    //check notification seen
    public async checkNotificationSeen(payload: { notification_id: number, user_id: number }) {
        return await this.db("notification_seen")
            .withSchema(this.AGENT_SCHEMA)
            .select("*")
            .where(payload);
    }
}
