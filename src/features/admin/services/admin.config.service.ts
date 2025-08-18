import { Request } from "express";
import AbstractServices from "../../../abstract/abstract.service";

class AdminConfigService extends AbstractServices {
  //create city
  public async createCity(req: Request) {
    const model = this.Model.commonModel();
    const data = await model.getAllCity({
      country_id: req.body.country_id,
      name: req.body.name,
    });
    if (data.length) {
      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.HTTP_CONFLICT,
      };
    }
    const res = await model.insertCity(req.body);

    return {
      success: true,
      code: this.StatusCode.HTTP_SUCCESSFUL,
      data: res[0].id,
    };
  }

  //insert visa type
  public async insertVisaType(req: Request) {
    await this.Model.VisaModel().insertVisaType({
      ...req.body,
      created_by: req.admin.id,
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_SUCCESSFUL,
      message: this.ResMsg.HTTP_SUCCESSFUL,
    };
  }

  //get all visa type
  public async getAllVisaType(req: Request) {
    const data = await this.Model.VisaModel().getAllVisaType();

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data,
    };
  }

  //delete visa type
  public async deleteVisaType(req: Request) {
    await this.Model.VisaModel().deleteVisaType(parseInt(req.params.id));

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
    };
  }

  //insert visa type
  public async insertVisaMode(req: Request) {
    await this.Model.VisaModel().insertVisaMode({
      ...req.body,
      created_by: req.admin.id,
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_SUCCESSFUL,
      message: this.ResMsg.HTTP_SUCCESSFUL,
    };
  }

  //get all visa type
  public async getAllVisaMode(req: Request) {
    const data = await this.Model.VisaModel().getAllVisaMode();

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data,
    };
  }

  //delete visa type
  public async deleteVisaMode(req: Request) {
    await this.Model.VisaModel().deleteVisaMode(parseInt(req.params.id));

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
    };
  }

  //get notification
  public async getNotification(req: Request) {
    const { id } = req.admin;
    const model = this.Model.adminNotificationModel();
    const query = req.query;
    query.user_id = id.toString();
    const data = await model.getNotifications(query);
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      total: data.total,
      data: data.data,
    };
  }

  //insert notification seen
  public async insertNotificationSeen(req: Request) {
    const { id } = req.admin;
    const model = this.Model.adminNotificationModel();
    const { notification_id } = req.body;
    if (!notification_id) {
      return {
        success: false,
        code: this.StatusCode.HTTP_UNPROCESSABLE_ENTITY,
        message: this.ResMsg.HTTP_UNPROCESSABLE_ENTITY,
      };
    }
    const checkNotification = await model.checkNotificationSeen({
      notification_id,
      user_id: id,
    });
    if (!checkNotification.length) {
      await model.insertNotificationSeen({ notification_id, user_id: id });
    }

    return {
      success: true,
      code: this.StatusCode.HTTP_SUCCESSFUL,
    };
  }

  //get error logs
  public async getErrorLogs(req: Request) {
    const model = this.Model.errorLogsModel();
    const data = await model.get(req.query);
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      total: data.total,
      data: data.data,
    };
  }

  //get audit trail
  public async getAuditTrail(req: Request) {
    const model = this.Model.adminAuditTrailModel();
    const data = await model.getAudit(req.query);
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      total: data.total,
      data: data.data,
    };
  }

  //get search history
  public async getSearchHistory(req: Request) {
    const model = this.Model.SearchHistoryModel();
    const { type, from_date, to_date, limit, skip, user_type, agency_id } =
      req.query;
    let data = {
      total: 0,
      data: [],
    };
    if (type === "flight") {
      data = await model.getFlightSearchHistory(
        {
          from_date: from_date as unknown as Date,
          to_date: to_date as unknown as Date,
          limit: limit as unknown as number,
          skip: skip as unknown as number,
          user_type: user_type as "Agent" | "User",
          agency_id: agency_id as unknown as number,
        },
        true
      );
    }
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      total: data.total,
      data: data.data,
    };
  }

  //insert airline
  public async insertAirlines(req: Request) {
    const files = (req.files as Express.Multer.File[]) || [];
    if (files?.length) {
      req.body[files[0].fieldname] = files[0].filename;
    }
    const body = req.body;
    const model = this.Model.commonModel();
    const insert_airline = await model.insertAirline(body);
    if (insert_airline.length) {
      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: this.ResMsg.HTTP_SUCCESSFUL,
      };
    } else {
      return {
        success: false,
        code: this.StatusCode.HTTP_INTERNAL_SERVER_ERROR,
        message: this.ResMsg.HTTP_INTERNAL_SERVER_ERROR,
      };
    }
  }

  //update airline
  public async updateAirlines(req: Request) {
    const airlines_id = req.params.id;

    const files = (req.files as Express.Multer.File[]) || [];

    if (files?.length) {
      req.body[files[0].fieldname] = files[0].filename;
    }
    const body = req.body;
    const model = this.Model.commonModel();
    await model.updateAirlines(body, Number(airlines_id));

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
    };
  }

  //delete airline
  public async deleteAirlines(req: Request) {
    const airlines_id = req.params.id;
    const model = this.Model.commonModel();
    const del_airline = await model.deleteAirlines(Number(airlines_id));
    if (del_airline > 0) {
      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.HTTP_OK,
      };
    } else {
      return {
        success: false,
        code: this.StatusCode.HTTP_BAD_REQUEST,
        message: this.ResMsg.HTTP_BAD_REQUEST,
      };
    }
  }

  //insert airport
  public async insertAirport(req: Request) {
    const body = req.body;
    const model = this.Model.commonModel();
    const checkAirport = await model.getAllAirport(
      { code: body.iata_code },
      false
    );
    // console.log({ body });
    if (checkAirport.data.length) {
      return {
        success: false,
        code: this.StatusCode.HTTP_CONFLICT,
        message: "Airport code already exist.",
      };
    }

    await model.insertAirport(body);

    return {
      success: true,
      code: this.StatusCode.HTTP_SUCCESSFUL,
      message: this.ResMsg.HTTP_SUCCESSFUL,
    };
  }

  //get all airport
  public async getAllAirport(req: Request) {
    const { country_id, name, limit, skip } = req.query as {
      country_id?: number;
      name?: string;
      limit?: number;
      skip?: number;
    };
    const model = this.Model.commonModel();
    const get_airport = await model.getAllAirport(
      { country_id, name, limit, skip },
      true
    );

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      total: parseInt(get_airport.total),
      data: get_airport.data,
    };
  }

  //update airport
  public async updateAirport(req: Request) {
    const airport_id = req.params.id;
    const body = req.body;
    const model = this.Model.commonModel();
    const update_airport = await model.updateAirport(body, Number(airport_id));

    if (update_airport > 0) {
      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.HTTP_OK,
      };
    } else {
      return {
        success: false,
        code: this.StatusCode.HTTP_BAD_REQUEST,
        message: this.ResMsg.HTTP_BAD_REQUEST,
      };
    }
  }

  //delete airport
  public async deleteAirport(req: Request) {
    const airport_id = req.params.id;
    const model = this.Model.commonModel();
    const del_airport = await model.deleteAirport(Number(airport_id));

    if (del_airport > 0) {
      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.HTTP_OK,
      };
    } else {
      return {
        success: false,
        code: this.StatusCode.HTTP_BAD_REQUEST,
        message: this.ResMsg.HTTP_BAD_REQUEST,
      };
    }
  }
}

export default AdminConfigService;
