import { TDB } from "../../features/public/utils/types/commonTypes";
import {
  createAgentLoanPayload,
  ICreateAgentLoanHistoryPayload,
  ICreateLoanRequestPayload,
  IGetAgentLoanData,
  IGetAgentLoanHistoryQuery,
  IGetAgentLoanParams,
  IGetLoanRequestFilterQuery,
  IUpdateLoanRequestPayload,
} from "../../utils/interfaces/agent/agentLoan.interface";
import { LOAN_TYPE } from "../../utils/miscellaneous/constants";
import Schema from "../../utils/miscellaneous/schema";

export class AgencyLoanModel extends Schema {
  private db: TDB;
  constructor(db: TDB) {
    super();
    this.db = db;
  }

  public async insertAgencyLoan(payload: createAgentLoanPayload) {
    return await this.db("agency_loan")
      .withSchema(this.AGENT_SCHEMA)
      .insert(payload, "id");
  }

  public async getTotalLoan(agency_id: number) {
    const data = await this.db(`${this.AGENT_SCHEMA}.agency_loan`)
      .select(
        this.db.raw(
          `
        (
          SELECT 
            SUM(CASE WHEN type = ${LOAN_TYPE.loan} THEN amount ELSE 0 END) - 
            SUM(CASE WHEN type = ${LOAN_TYPE.repayment} THEN amount ELSE 0 END) 
          AS loan_balance 
          FROM ${this.AGENT_SCHEMA}.agency_loan 
          WHERE agency_id = ?
        ) AS loan_balance
        `,
          [agency_id]
        )
      )
      .first();
    if (data) {
      return Number(data.loan_balance);
    } else {
      return 0;
    }
  }

  public async getAgencyLoanHistory(
    params: IGetAgentLoanParams,
    need_total: boolean = true
  ) {
    const data = await this.db(`${this.AGENT_SCHEMA}.agency_loan as al`)
      .select(
        "al.id",
        "al.type",
        "al.amount",
        "al.date",
        "al.details",
        "a.username as loan_given_by",
        this.db.raw(
          `(SELECT SUM(CASE WHEN acl.type = ? THEN acl.amount ELSE 0 END) - SUM(CASE WHEN acl.type = ? THEN acl.amount ELSE 0 END) as loan_balance FROM agent.agency_loan AS acl where acl.agency_id = al.agency_id and acl.id <= al.id and acl.agency_id = ? ) as last_loan_balance`,
          [LOAN_TYPE.loan, LOAN_TYPE.repayment, params.agency_id]
        )
      )
      .leftJoin("admin.user_admin AS a", "al.loan_given_by", "a.id")
      .where((qb) => {
        qb.andWhere("al.agency_id", params.agency_id);
        if (params.start_date && params.end_date) {
          qb.andWhereBetween("al.date", [params.start_date, params.end_date]);
        }
        if (params.type) {
          qb.andWhere("al.type", params.type);
        }
        if (params.search) {
          qb.andWhere("al.details", "like", `%${params.search}%`);
        }
      })
      .orderBy("al.id", "asc")
      .limit(params.limit ? params.limit : 100)
      .offset(params.skip ? params.skip : 0);

    let total: any[] = [];

    if (need_total) {
      total = await this.db("agent.agency_loan as al")
        .count("* AS total")
        .where((qb) => {
          qb.andWhere("al.agency_id", params.agency_id);
          if (params.start_date && params.end_date) {
            qb.andWhereBetween("al.date", [params.start_date, params.end_date]);
          }
          if (params.type) {
            qb.andWhere("al.type", params.type);
          }
          if (params.search) {
            qb.andWhere("al.details", "like", `%${params.search}%`);
          }
        });
    }

    return { data, total: total[0]?.total };
  }

  public async getAllLoanHistory(params: {
    limit?: number;
    skip?: number;
    from_date?: string;
    to_date?: string;
    agency_id?: number;
    type?: string;
  }) {
    const data = await this.db("agency_loan as ad")
      .withSchema(this.AGENT_SCHEMA)
      .select(
        "ad.id",
        "ad.agency_id",
        "ai.agency_name",
        "ad.type",
        "ad.amount",
        "ad.date",
        "a.first_name as deposited_by",
        "ad.details",
        this.db.raw(
          `(SELECT 
            SUM(CASE WHEN al2.type = ? THEN al2.amount ELSE 0 END) - 
            SUM(CASE WHEN al2.type = ? THEN al2.amount ELSE 0 END)
          FROM ${this.AGENT_SCHEMA}.agency_loan as al2 
          WHERE al2.agency_id = ad.agency_id 
            AND al2.id <= ad.id
        ) AS loan_balance`,
          [LOAN_TYPE.loan, LOAN_TYPE.repayment]
        )
      )
      .join("agency_info as ai", "ai.id", "ad.agency_id")
      .joinRaw(
        `LEFT JOIN ${this.ADMIN_SCHEMA}.user_admin as a ON ad.loan_given_by = a.id`
      )
      .where((qb) => {
        if (params.from_date && params.to_date) {
          qb.andWhereBetween("ad.date", [params.from_date, params.to_date]);
        }
        if (params.agency_id) {
          qb.andWhere("ad.agency_id", params.agency_id);
        }
        if (params.type) {
          qb.andWhere("ad.type", params.type);
        }
      })
      .limit(params.limit || 100)
      .offset(params.skip || 0)
      .orderBy("ad.id", "desc");

    const total = await this.db("agency_loan as ad")
      .withSchema(this.AGENT_SCHEMA)
      .count("ad.id as total")
      .where((qb) => {
        if (params.from_date && params.to_date) {
          qb.andWhereBetween("ad.date", [params.from_date, params.to_date]);
        }
        if (params.agency_id) {
          qb.andWhere("ad.agency_id", params.agency_id);
        }
        if (params.type) {
          qb.andWhere("ad.type", params.type);
        }
      });

    return { data, total: total[0]?.total };
  }

  //================================ Loan Request =================================/

  public async createLoanRequest(payload: ICreateLoanRequestPayload) {
    return await this.db("loan_request")
      .withSchema(this.AGENT_SCHEMA)
      .insert(payload, "id");
  }

  public async updateLoanRequest(
    payload: IUpdateLoanRequestPayload,
    id: number
  ) {
    const data = await this.db("loan_request")
      .withSchema(this.AGENT_SCHEMA)
      .update(payload)
      .where({ id });
  }

  public async getLoanRequest(
    query: IGetLoanRequestFilterQuery,
    is_total: boolean = false
  ) {
    const data = await this.db("loan_request as lr")
      .withSchema(this.AGENT_SCHEMA)
      .select(
        "lr.id",
        "lr.amount",
        "lr.agency_id",
        "bu.name as created_by",
        "ai.agency_name",
        "lr.details",
        "lr.note",
        "lr.status",
        "lr.created_at"
      )
      .leftJoin("agency_info as ai", "ai.id", "lr.agency_id")
      .leftJoin("btob_user as bu", "bu.id", "lr.created_by")
      .where((qb) => {
        if (query.agency_id) {
          qb.andWhere("lr.agency_id", query.agency_id);
        }
        if (query.status) {
          qb.andWhere("lr.status", query.status);
        }
        if (query.from_date && query.to_date) {
          qb.andWhereBetween("lr.created_at", [query.from_date, query.to_date]);
        }
        if (query.id) {
          qb.andWhere("lr.id", query.id);
        }
      })
      .limit(query.limit || 100)
      .offset(query.skip || 0)
      .orderBy("lr.id", "desc");

    let total: any[] = [];
    if (is_total) {
      total = await this.db("loan_request as lr")
        .withSchema(this.AGENT_SCHEMA)
        .count("lr.id as total")
        .where((qb) => {
          if (query.agency_id) {
            qb.andWhere("lr.agency_id", query.agency_id);
          }
          if (query.status) {
            qb.andWhere("lr.status", query.status);
          }
          if (query.from_date && query.to_date) {
            qb.andWhereBetween("lr.created_at", [
              query.from_date,
              query.to_date,
            ]);
          }
          if (query.id) {
            qb.andWhere("lr.id", query.id);
          }
        });
    }

    return {
      data,
      total: total[0]?.total,
    };
  }
}
