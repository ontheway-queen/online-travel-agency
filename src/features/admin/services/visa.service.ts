import { Request } from 'express';
import AbstractServices from '../../../abstract/abstract.service';
import Lib from '../../../utils/lib/lib';
import { PROJECT_EMAIL_OTHERS_1 } from '../../../utils/miscellaneous/constants';
import { email_template_to_send_notification } from '../../../utils/templates/adminNotificationTemplate';

export class AdminVisaService extends AbstractServices {
  //create visa
  public async createVisa(req: Request) {
    const { id } = req.admin;

    const file = (req.files as Express.Multer.File[]) || [];

    const model = this.Model.VisaModel();

    const body = req.body;
    body.created_by = id;

    if (file) {
      const image = file[0].filename;
      body.image = image;
      const create = await model.create(body);
      if (create.length) {
        return {
          success: true,
          code: this.StatusCode.HTTP_SUCCESSFUL,
          message: this.ResMsg.HTTP_SUCCESSFUL,
        };
      }
    }

    //send email to admin
    await Lib.sendEmail(
      [PROJECT_EMAIL_OTHERS_1],
      `visa has been created`,
      email_template_to_send_notification({
        title: "Visa has been created",
        details: {
          details: `New visa has been created`
        }
      })
    );


    return {
      success: false,
      code: this.StatusCode.HTTP_INTERNAL_SERVER_ERROR,
      message: this.ResMsg.HTTP_INTERNAL_SERVER_ERROR,
    };
  }

  //get visa
  public async getVisa(req: Request) {
    const model = this.Model.VisaModel();
    const data = await model.get(req.query, true);
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      total: data.total,
      data: data.data,
    };
  }

  //get single visa
  public async getSingleVisa(req: Request) {
    const id = req.params.id;
    const model = this.Model.VisaModel();
    const data = await model.single(Number(id));
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data: data[0],
    };
  }

  //update visa
  public async updateVisa(req: Request) {
    const id = req.params.id;
    const file = (req.files as Express.Multer.File[]) || [];

    if (file.length) {
      const model = this.Model.VisaModel();

      const visa: any = await model.single(Number(id));

      await this.manageFile.deleteFromCloud(visa.image);

      const res = await model.update(
        { ...req.body, image: file[0].filename },
        Number(id)
      );

      if (res) {
        return {
          success: true,
          code: this.StatusCode.HTTP_OK,
          data: req.body,
        };
      } else {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: this.ResMsg.HTTP_BAD_REQUEST,
        };
      }
    } else {
      const model = this.Model.VisaModel();

      const res = await model.update(req.body, Number(id));

      if (res) {
        return {
          success: true,
          code: this.StatusCode.HTTP_OK,
          data: req.body,
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

  //////-------b2c-----------//

  //get b2c applications
  public async getB2CApplications(req: Request) {
    const model = this.Model.VisaModel();
    const data = await model.getB2CApplication(req.query, true);
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      total: data.total,
      data: data.data,
    };
  }

  //get b2c single application
  public async getB2CSingleApplication(req: Request) {
    const id = req.params.id;
    const model = this.Model.VisaModel();
    const paymentModel = this.Model.paymentModel();
    const data = await model.b2cSingleApplication(Number(id));
    if (!data) {
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: this.ResMsg.HTTP_NOT_FOUND,
      };
    }
    const traveler_data = await model.b2cTravelerList(Number(id));
    const tracking_data = await model.b2cTrackingList(Number(id));
    const invoice_data = await paymentModel.getInvoiceByBookingId(Number(id), 'visa');
    const payment_data = invoice_data?.[0]?.id ? await paymentModel.singleMoneyReceipt(invoice_data[0].id) : [];
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data: {
        ...data,
        traveler_data,
        tracking_data,
        invoice_data,
        payment_data,
      },
    };
  }

  //create b2c tracking of application
  public async createB2CTrackingOfApplication(req: Request) {
    const id = req.params.id;
    const model = this.Model.VisaModel();
    const data = await model.b2cSingleApplication(Number(id));
    if (!data) {
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: this.ResMsg.HTTP_NOT_FOUND,
      };
    }

    req.body.application_id = id;
    const create_tracking = await model.b2cCreateTracking(req.body);
    if (create_tracking.length) {
      //send email to admin
      await Lib.sendEmail(
        [PROJECT_EMAIL_OTHERS_1],
        `B2C visa has been updated`,
        email_template_to_send_notification({
          title: "B2C visa has been updated",
          details: {
            details: `Visa application id ${id} has been updated`
          }
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

  //--------b2b-----------//
  //get b2b applications
  public async getB2BApplications(req: Request) {
    const model = this.Model.VisaModel();
    const data = await model.getB2BApplication(req.query, true);
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      total: data.total,
      data: data.data,
    };
  }

  //get b2b single application
  public async getB2BSingleApplication(req: Request) {
    const id = req.params.id;
    const model = this.Model.VisaModel();
    const data = await model.b2bSingleApplication(Number(id));
    if (!data.length) {
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: this.ResMsg.HTTP_NOT_FOUND,
      };
    }
    const traveler_data = await model.b2bTravelerList(Number(id));
    const tracking_data = await model.b2bTrackingList(Number(id));
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data: { ...data[0], traveler_data, tracking_data },
    };
  }

  //create b2b tracking of application
  public async createB2BTrackingOfApplication(req: Request) {
    const id = req.params.id;
    const model = this.Model.VisaModel();
    const data = await model.b2bSingleApplication(Number(id));
    if (!data.length) {
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: this.ResMsg.HTTP_NOT_FOUND,
      };
    }

    req.body.application_id = id;
    const create_tracking = await model.b2bCreateTracking(req.body);
    //send email to admin
    await Lib.sendEmail(
      [PROJECT_EMAIL_OTHERS_1],
      `B2B visa has been updated`,
      email_template_to_send_notification({
        title: "B2B visa has been updated",
        details: {
          details: `Visa application id ${id} has been updated`
        }
      })
    );
    if (create_tracking.length) {
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
}
