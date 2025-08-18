import { Request } from "express";

import AbstractServices from "../../../../abstract/abstract.service";
import {
  template_onDepositReqUpdate_send_to_agent,
  template_onDepositToAgency_send_to_agent,
} from "../../../../utils/templates/depositTemplates";
import Lib from "../../../../utils/lib/lib";
import { newAgencyAccount } from "../../../../utils/templates/sendEmailCredential";
import {
  PROJECT_CODE,
  PROJECT_EMAIL_OTHERS_1,
} from "../../../../utils/miscellaneous/constants";
import { email_template_to_send_notification } from "../../../../utils/templates/adminNotificationTemplate";
import config from "../../../../config/config";

export class AdminAgentAgencyService extends AbstractServices {
  constructor() {
    super();
  }

  public async adjustAgencyBalance(req: Request) {
    const { id: admin_id } = req.admin;
    const body = req.body;
    body.admin_id = admin_id;
    const model = this.Model.agencyModel();

    const checkAgency = await model.getSingleAgency(req.body.agency_id);

    if (!checkAgency.length) {
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: "Agency not found",
      };
    }

    const file = (req.files as Express.Multer.File[]) || [];

    if (file.length) {
      if (file[0].fieldname === "payment_slip_file") {
        body[file[0].fieldname] = file[0].filename;
      }
    }

    const res = await model.insertAgencyLedger(body);
    if (res) {
      // send email
      await Lib.sendEmail(
        checkAgency[0].email,
        `Your account has been ${body.type}ed with BDT ${body.amount}`,
        template_onDepositToAgency_send_to_agent({
          amount: body.amount,
          remarks: body.details,
          type: body.type,
          date_time: new Date().toLocaleString(),
        })
      );

      //send email to admin
      await Lib.sendEmail(
        PROJECT_EMAIL_OTHERS_1,
        `Agency adjust balance`,
        email_template_to_send_notification({
          title: "adjust balance has been made for agency",
          details: {
            details: `Balance has been adjusted. Type: ${body.type}. Amount: ${body.amount}`,
          },
        })
      );

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

  //get list
  public async getAllDepositRequestList(req: Request) {
    const { limit, skip, status } = req.query;
    const data = await this.Model.agencyModel().getAllAgencyDepositRequest({
      limit: Number(limit),
      skip: Number(skip),
      status: status as string,
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      total: data.total,
      data: data.data,
    };
  }

  //get list
  public async updateDepositRequest(req: Request) {
    const { id } = req.params;
    const { status: bdy_status, reason, remarks: body_remarks } = req.body;

    const model = this.Model.agencyModel();

    // get single deposit
    const data = await model.getSingleDeposit({
      id: parseInt(req.params.id),
    });

    if (!data.length) {
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: this.ResMsg.HTTP_NOT_FOUND,
      };
    }

    const {
      status,
      amount,
      remarks,
      agency_id,
      bank_name,
      payment_date,
      agency_email,
      agency_logo,
      agency_name,
    } = data[0];

    if (status == "pending" && bdy_status == "approved") {
      //add credit to agency ledger
      await model.insertAgencyLedger({
        type: "credit",
        amount,
        agency_id,
        created_by: req.admin.id,
        details: body_remarks
      });

      //update deposit request
      await model.updateAgencyDepositRequest(
        {
          status: bdy_status,
          reason,
          remarks: body_remarks,
        },
        { id: parseInt(id), agency_id }
      );

      //
    } else {
      await model.updateAgencyDepositRequest(
        {
          status: bdy_status,
          reason,
          remarks: body_remarks,
        },
        { id: parseInt(id), agency_id }
      );
    }

    await Lib.sendEmail(
      agency_email,
      `Your deposit request of BDT ${amount} has been ${
        bdy_status === "approved" ? "approved" : "rejected"
      }`,
      template_onDepositReqUpdate_send_to_agent({
        title: "Deposit Request Acknowledgement",
        bank_name: bank_name,
        total_amount: amount,
        agency_name,
        remarks,
        logo: agency_logo,
        payment_date: payment_date,
        status: bdy_status,
      })
    );

    //send email to admin
    await Lib.sendEmail(
      PROJECT_EMAIL_OTHERS_1,
      `Deposit req has been updated`,
      email_template_to_send_notification({
        title: "Deposit req has been updated",
        details: {
          details: `Deposit request of BDT ${amount} has been ${
            bdy_status === "approved" ? "approved" : "rejected"
          }`,
        },
      })
    );

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: "Updated Successfully",
    };
  }

  //get all transaction list
  public async getAllTransaction(req: Request) {
    const model = this.Model.agencyModel();
    const { limit, skip, from_date, to_date, agency_id } =
      req.query as unknown as {
        limit: number;
        skip: number;
        from_date: string;
        to_date: string;
        agency_id: number;
      };
    const data = await model.getAllTransaction({
      limit,
      skip,
      from_date,
      to_date,
      agency_id,
    });
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      total: data.total,
      data: data.data,
    };
  }

  //get transaction
  public async getTransaction(req: Request) {
    const { id } = req.params;
    const model = this.Model.agencyModel();
    const { start_date, end_date, limit, skip } = req.query;
    const data = await model.getAgencyTransactions({
      agency_id: Number(id),
      start_date: start_date as string,
      end_date: end_date as string,
      limit: limit as unknown as number,
      skip: skip as unknown as number,
    });
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      total: data.total,
      data: data.data,
    };
  }

  // Create agency
  public async create(req: Request) {
    return this.db.transaction(async (trx) => {
      const model = this.Model.btobAdministrationModel(trx);
      const { id: admin_id } = req.admin;
      const {
        agency_name,
        agency_email,
        agency_phone,
        user_name,
        user_email,
        user_password,
        user_phone,
        commission_set_id,
        address,
      } = req.body;

      const files = (req.files as Express.Multer.File[]) || [];
      const agencyModel = this.Model.agencyModel(trx);

      const agencyBody: any = {
        agency_name,
        email: agency_email,
        phone: agency_phone,
        created_by: admin_id,
        commission_set_id,
        address,
      };

      const checkEmail = await agencyModel.getSingleUser({ email: user_email });

      if (checkEmail.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_CONFLICT,
          message: "Email already exist.",
        };
      }

      if (req.body.kam_email) {
        const kam_info = await this.Model.adminModel(trx).getSingleAdmin({
          email: req.body.kam_email,
        });
        if (!kam_info.length) {
          return {
            success: false,
            code: this.StatusCode.HTTP_NOT_FOUND,
            message: "No admin has been found with this email address",
          };
        }
        agencyBody.kam = kam_info[0].id;
      }

      const hashed_password = await Lib.hashPass(user_password);

      const userBody: any = {
        name: user_name,
        email: user_email,
        hashed_password,
        mobile_number: user_phone,
      };

      files.forEach((item) => {
        if (item.fieldname === "agency_logo") {
          agencyBody["agency_logo"] = item.filename;
        } else if (item.fieldname === "user_photo") {
          userBody["photo"] = item.filename;
        } else if (item.fieldname === "trade_license") {
          agencyBody["trade_license"] = item.filename;
        } else if (item.fieldname === "visiting_card") {
          agencyBody["visiting_card"] = item.filename;
        }
      });

      //unique id of agency
      let agency_ref_number = `${PROJECT_CODE}AR-`;
      const getLastAgency = await agencyModel.checkAgency({
        limit: 1,
      });
      if (!getLastAgency.data.length) {
        agency_ref_number += "1000";
      } else {
        const lastRef = getLastAgency.data?.[0]?.agency_ref_number
          ? getLastAgency.data?.[0]?.agency_ref_number?.split("-")[1]
          : "0";
        const nextNumber = (parseInt(lastRef, 10) + 1)
          .toString()
          .padStart(4, "0");
        agency_ref_number += nextNumber;
      }
      agencyBody.agency_ref_number = agency_ref_number;

      const agency = await agencyModel.createAgency(agencyBody);

      userBody["agency_id"] = agency[0].id;

      // let btocToken = '';

      // if (btoc_commission) {
      //   btocToken = uuidv4();
      //   await agencyModel.insertAgencyBtoCToken({
      //     agency_id: agency[0],
      //     token: btocToken,
      //   });
      // }

      const userRes = await agencyModel.createAgencyUser(userBody);
      // console.log(userRes)

      const role_res = await model.createRole({
        name: "super-admin",
        created_by: userRes[0].id,
        agency_id: agency[0].id,
      });

      const { data: permissions } = await model.permissionsList({});

      if (permissions.length) {
        const permission_body = permissions.map((element: any) => {
          return {
            role_id: parseInt(role_res[0].id),
            permission_id: parseInt(element.permission_id),
            read: 1,
            write: 1,
            update: 1,
            delete: 1,
            created_by: userRes[0].id,
            agency_id: agency[0].id,
          };
        });
        // console.log(permission_body)
        await model.createRolePermission(permission_body);
      }

      // update agency
      await agencyModel.updateAgencyUser(
        { role_id: parseInt(role_res[0].id) },
        userRes[0].id
      );

      const mailSubject = "Credentials For B2B Login.";

      if (userRes.length) {
        await Lib.sendEmail(
          user_email,
          mailSubject,
          newAgencyAccount(user_email, user_password)
        );
      }

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: this.ResMsg.HTTP_SUCCESSFUL,
        data: {
          id: agency[0].id,
          agency_logo: agencyBody.agency_logo,
          user_photo: userBody.photo,
        },
      };
    });
  }

  // get agency
  public async get(req: Request) {
    const query = req.query;
    const agencyModel = this.Model.agencyModel();
    const { data, total } = await agencyModel.getAgency(query);

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      data,
      total,
    };
  }

  // get single agency
  public async getSingle(req: Request) {
    const { id } = req.params;
    const agencyModel = this.Model.agencyModel();

    const data = await agencyModel.getSingleAgency(Number(id));

    if (!data.length) {
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: this.ResMsg.HTTP_NOT_FOUND,
      };
    }

    const query = req.query;
    const users = await agencyModel.getUser({
      agency_id: Number(id),
      ...query,
    });

    const balance = await agencyModel.getTotalBalance(Number(id));

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      data: {
        ...data[0],
        users,
        balance,
      },
    };
  }

  // update single agency
  public async update(req: Request) {
    return await this.db.transaction(async (trx) => {
      const body = req.body;
      const { id } = req.params;

      const files = (req.files as Express.Multer.File[]) || [];
      const agencyModel = this.Model.agencyModel(trx);
      const agency = await agencyModel.checkAgency({ id: Number(id) });

      if (body.email && agency.data[0].email !== body.email) {
        const checkEmail = await agencyModel.checkAgency({
          email: body.email,
        });

        if (checkEmail.data.length) {
          return {
            success: false,
            code: this.StatusCode.HTTP_CONFLICT,
            message: "the email already exists",
          };
        }
      }

      files.forEach((item) => {
        if (item.fieldname === "agency_logo") {
          body["agency_logo"] = item.filename;
        } else if (item.fieldname === "user_photo") {
          body["photo"] = item.filename;
        } else if (item.fieldname === "trade_license") {
          body["trade_license"] = item.filename;
        } else if (item.fieldname === "visiting_card") {
          body["visiting_card"] = item.filename;
        }
      });

      const { kam_email, ...rest } = body;

      if (kam_email) {
        const adminModel = this.Model.adminModel(trx);
        const getAdmin = await adminModel.getSingleAdmin({ email: kam_email });
        if (!getAdmin.length) {
          return {
            success: false,
            code: this.StatusCode.HTTP_NOT_FOUND,
            message: "No admin has been found with this email",
          };
        }
        rest.kam = getAdmin[0].id;
      }

      await agencyModel.updateAgency(rest, Number(id));

      //send email to admin
      await Lib.sendEmail(
        [
          PROJECT_EMAIL_OTHERS_1,
        ],
        `Agency has been updated`,
        email_template_to_send_notification({
          title: "Agency has been updated",
          details: {
            details: `Agency ${agency.data?.[0]?.agency_name} has been updated`,
          },
        })
      );

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.HTTP_OK,
        data: {
          agency_logo: body.agency_logo,
        },
      };
    });
  }

  // create agency user
  public async createUser(req: Request) {
    const { agency_id, name, email, password, mobile_number } = req.body;
    const userModel = this.Model.agencyModel();
    const checkEmail = await userModel.getSingleUser({ email });
    const files = (req.files as Express.Multer.File[]) || [];

    if (checkEmail.length) {
      return {
        success: false,
        code: this.StatusCode.HTTP_CONFLICT,
        message: "Email already exist.",
      };
    }

    const hashed_password = await Lib.hashPass(password);

    const userBody: any = {
      name,
      email,
      hashed_password,
      mobile_number,
      agency_id,
    };

    if (files.length) {
      userBody["photo"] = files[0].filename;
    }

    const newUser = await userModel.createAgencyUser(userBody);

    const mailSubject = "Credentials For B2B Login.";

    if (newUser.length) {
      await Lib.sendEmail(
        email,
        mailSubject,
        newAgencyAccount(email, password)
      );
      await Lib.sendEmail(
        [
          PROJECT_EMAIL_OTHERS_1,
        ],
        mailSubject,
        newAgencyAccount(email, password)
      );
    }

    return {
      success: true,
      code: this.StatusCode.HTTP_SUCCESSFUL,
      message: this.ResMsg.HTTP_SUCCESSFUL,
      data: {
        id: newUser[0].id,
        photo: userBody.photo,
      },
    };
  }

  // update agency user
  public async updateUser(req: Request) {
    const { id } = req.params;
    const userModel = this.Model.agencyModel();
    const checkUser = await userModel.getSingleUser({ id: Number(id) });
    const files = (req.files as Express.Multer.File[]) || [];
    const body = req.body;

    if (!checkUser.length) {
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: this.ResMsg.HTTP_NOT_FOUND,
      };
    }

    if (body.email && body.email !== checkUser[0].email) {
      const checkEmail = await userModel.getSingleUser({ email: body.email });

      if (checkEmail.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_CONFLICT,
          message: "The email already exists",
        };
      }
    }

    const userBody: any = {
      ...body,
    };

    if (files.length) {
      userBody["photo"] = files[0].filename;
    }

    await userModel.updateAgencyUser(userBody, Number(id));

    if (files.length && checkUser[0].photo) {
      await this.manageFile.deleteFromCloud([checkUser[0].photo]);
    }

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
    };
  }

  //agent login
  public async agentPortalLogin(req: Request) {
    const { id } = req.params;

    const agencyModel = this.Model.agencyModel();

    const getAgency = await agencyModel.getSingleAgency(Number(id));

    if (!getAgency.length) {
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: "Agency not found!",
      };
    }

    const checkUser = await agencyModel.getSingleUser({
      agency_id: Number(id),
      status: true,
    });

    if (!checkUser.length) {
      return {
        success: false,
        code: 404,
        message: "User not found!",
      };
    }

    const {
      password: user_password,
      role_id,
      agency_id,
      ...rest
    } = checkUser[0];

    if (rest.status == false) {
      return {
        success: false,
        code: this.StatusCode.HTTP_FORBIDDEN,
        message: "Your account has been disabled",
      };
    }

    if (getAgency[0]?.status == false) {
      return {
        success: false,
        code: this.StatusCode.HTTP_FORBIDDEN,
        message: "Your agency account has been disabled",
      };
    }

    const agencyAdmModel = this.Model.btobAdministrationModel();

    let role_permission: any = [];

    if (role_id) {
      role_permission = await agencyAdmModel.getSingleRole({
        id: parseInt(role_id),
        agency_id,
      });
    }

    const token_data = {
      id: rest.id,
      name: rest.name,
      email: rest.email,
      mobile_number: rest.mobile_number,
      photo: rest.photo,
      user_status: rest.status,
      agency_id: agency_id,
      ref_id: getAgency[0].ref_id,
      agency_logo: getAgency[0].agency_logo,
      agency_name: getAgency[0].agency_name,
      agency_status: getAgency[0].status,
      commission_set_id: getAgency[0].commission_set_id,
    };

    const token = Lib.createToken(token_data, config.JWT_SECRET_AGENT, "1h");
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.LOGIN_SUCCESSFUL,
      token,
    };
  }
}
