import { TDB } from "../../features/public/utils/types/commonTypes";
import { ICreateB2BRefundRequestPayload, IInsertB2BRefundRequest_tickets, IUpdateB2BRefundRequestPayload } from "../../utils/interfaces/refund/b2bRefundRequestTypes";
import Schema from "../../utils/miscellaneous/schema";

export class B2BRefundRequestModel extends Schema {
    private db: TDB;
    constructor(db: TDB) {
        super();
        this.db = db;
    }


    public async createRefundRequest(payload: ICreateB2BRefundRequestPayload) {
        return await this.db("refund_request")
            .withSchema(this.AGENT_SCHEMA)
            .insert(payload, "id");
    }

    public async createRefundRequestTickets(payload: IInsertB2BRefundRequest_tickets | IInsertB2BRefundRequest_tickets[]) {
        return await this.db("refund_request_tickets")
            .withSchema(this.AGENT_SCHEMA)
            .insert(payload, "id");
    }

    public async updateRefundRequest(payload: IUpdateB2BRefundRequestPayload, id: number) {
        return await this.db("refund_request")
            .withSchema(this.AGENT_SCHEMA)
            .update(payload)
            .where({ id });
    }

    public async getRefundRequestList(query: { limit?: number, skip?: number, status?: string, staff_status?: string, from_date?: Date, to_date?: Date, agency_id?: number }, is_total: boolean = false) {
        const data = await this.db("view_refund_request")
            .withSchema(this.AGENT_SCHEMA)
            .select("id",'ref_no','booking_id','booking_ref','status','api','staff_status','staff_name','reason','created_at', 'staff_id', 'refund_amount', 'convenience_fee')
            .where((qb) => {
                if (query.status) {
                    qb.andWhere("status", query.status)
                }
                if (query.staff_status) {
                    qb.andWhere("staff_status", query.staff_status)
                }
                if (query.from_date && query.to_date) {
                    qb.andWhereBetween("created_at", [query.from_date, query.to_date])
                }
                if(query.agency_id){
                    qb.andWhere("agency_id",query.agency_id)
                }
            })
            .limit(query.limit || 100)
            .offset(query.skip || 0)
            .orderBy("id", "desc")

        let total: any[] = [];
        if (is_total) {
            total = await this.db("view_refund_request")
                .withSchema(this.AGENT_SCHEMA)
                .count("id as total")
                .where((qb) => {
                    if (query.status) {
                        qb.andWhere("status", query.status)
                    }
                    if (query.staff_status) {
                        qb.andWhere("staff_status", query.staff_status)
                    }
                    if (query.from_date && query.to_date) {
                        qb.andWhereBetween("created_at", [query.from_date, query.to_date])
                    }
                    if(query.agency_id){
                        qb.andWhere("agency_id",query.agency_id)
                    }
                })
        }

        return {
            data,
            total: total?.[0]?.total
        }
    }

    public async getSingleRefundRequest(where: {id?: number, booking_id?: number, agency_id?: number}){
        return await this.db("view_refund_request")
        .withSchema(this.AGENT_SCHEMA)
        .select("*")
        .where((qb)=>{
            if(where.id){
                qb.andWhere("id",where.id)
            }
            if(where.booking_id){
                qb.andWhere("booking_id",where.booking_id)
            }
            if(where.agency_id){
                qb.andWhere("agency_id", where.agency_id)
            }
        });
    }

    public async getRefundRequestTickets(refund_request_id: number){
        return await this.db("refund_request_tickets")
        .withSchema(this.AGENT_SCHEMA)
        .select("*")
        .where({refund_request_id});
    }


}
