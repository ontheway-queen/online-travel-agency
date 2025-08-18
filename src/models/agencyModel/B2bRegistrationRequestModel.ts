import { TDB } from "../../features/public/utils/types/commonTypes";
import {
  B2bRegistrationRequestParams,
  B2bRegistrationRequestPayload,
} from "../../utils/interfaces/agent/b2bRegistrationRequest.interfacet";
import Schema from "../../utils/miscellaneous/schema";

export class B2bRegistrationRequestModel extends Schema {
  private db: TDB;

  constructor(db: TDB) {
    super();
    this.db = db;
  }

  // Create B2B registration request
  public async createRegistrationRequest(
    payload: B2bRegistrationRequestPayload
  ) {
    return await this.db("b2b_registration_request")
      .withSchema(this.AGENT_SCHEMA)
      .insert(payload, "id");
  }

  // Update B2B registration request
  public async updateRegistrationRequest(
    query: { id?: number; email?: string },
    payload: Partial<B2bRegistrationRequestPayload>
  ) {
    const { id, email } = query;
    return await this.db("b2b_registration_request AS br")
      .withSchema(this.AGENT_SCHEMA)
      .where((qb) => {
        if (id) {
          qb.andWhere("br.id", id);
        }
        if (email) {
          qb.andWhere("br.email", email);
        }
      })
      .update(payload, "id");
  }

  // Get all B2B registration requests
  public async getAllRegistrationRequests(query: B2bRegistrationRequestParams) {
    const { limit, skip, status, state, email, key } = query;
    const data = this.db("b2b_registration_request AS br")
      .withSchema(this.AGENT_SCHEMA)
      .select(
        "br.id",
        "br.name",
        "br.email",
        "br.mobile_number",
        "br.photo",
        "br.status",
        "br.created_at",
        "br.address",
        "br.postal_code",
        "br.approved_by",
        "br.rejected_by",
        "br.rejected_reason",
        "br.state",
        "br.agency_name",
        "br.agency_logo",
        "br.agency_phone",
        "br.agency_email",
        "br.trade_license",
        "br.visiting_card"
      )
      .where((qb) => {
        if (state) {
          qb.andWhere("br.state", state);
        }
        if (status) {
          qb.andWhere("br.status", status);
        }

        if (key) {
          qb.andWhere((subQuery) => {
            subQuery.orWhereILike("br.email", `%${key}%`);
            subQuery.orWhereILike("br.name", `%${key}%`);
          });
        }
      })
      .orderBy("id", "desc");

    if (limit) {
      data.limit(limit);
    }
    if (skip) {
      data.offset(skip);
    }

    const totals = await this.db("b2b_registration_request AS br")
      .withSchema(this.AGENT_SCHEMA)
      .count("* as count")
      .where((qb) => {
        if (state) {
          qb.andWhere("br.state", state);
        }
        if (status !== undefined) {
          qb.andWhere("br.status", status);
        }

        if (key) {
          qb.andWhere((subQuery) => {
            subQuery.orWhereILike("br.email", `%${key}%`);
            subQuery.orWhereILike("br.name", `%${key}%`);
          });
        }
      });

    return {
      data: await data,
      total: Number(totals[0].count as string),
    };
  }

  // Get single B2B registration request
  public async getSingleRegistrationRequest(query: {
    id?: number;
    email?: string;
  }) {
    const { id, email } = query;
    return await this.db("b2b_registration_request AS br")
      .withSchema(this.AGENT_SCHEMA)
      .select(
        "br.id",
        "br.name",
        "br.email",
        "br.mobile_number",
        "br.photo",
        "br.status",
        "br.created_at",
        "br.address",
        "br.postal_code",
        "br.approved_by",
        "br.rejected_by",
        "br.rejected_reason",
        "br.state",
        "br.agency_name",
        "br.agency_logo",
        "br.agency_phone",
        "br.agency_email",
        "br.trade_license",
        "br.visiting_card",
        this.db.raw(
          "CONCAT(au1.first_name, ' ', au1.last_name) AS approved_by_name"
        ),
        this.db.raw(
          "CONCAT(au2.first_name, ' ', au2.last_name) AS rejected_by_name"
        )
      )
      .joinRaw("LEFT JOIN admin.user_admin AS au1 ON au1.id = approved_by")
      .joinRaw("LEFT JOIN admin.user_admin AS au2 ON au2.id = rejected_by")
      .where((qb) => {
        if (id) {
          qb.andWhere("br.id", id);
        }
        if (email) {
          qb.andWhere("br.email", email);
        }
      })
      .first();
  }
}
