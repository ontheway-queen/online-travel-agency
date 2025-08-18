import { Request } from "express";
import AbstractServices from "../../../abstract/abstract.service";
import Lib from "../../../utils/lib/lib";
import { PROJECT_EMAIL_OTHERS_1} from "../../../utils/miscellaneous/constants";
import { email_template_to_send_notification } from "../../../utils/templates/adminNotificationTemplate";

export class AdminBtocService extends AbstractServices {
  constructor() {
    super();
  }
  //get users
  public async getUsers(req: Request) {
    const model = this.Model.userModel();
    const data = await model.getAllUser(req.query, true);
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data: data.data,
      total: data.total,
    };
  }

  //get user details
  public async getSingleUser(req: Request) {
    const id = Number(req.params.id);
    const model = this.Model.userModel();
    const visaBookingModel = this.Model.VisaModel();
    const tourBookingModel = this.Model.tourPackageBookingModel();

    const data = await model.getProfileDetails({ id });
    const visa_booking_data =
      await visaBookingModel.getSingleUserVisaApplication({ user_id: id });
    const tour_booking_data =
      await tourBookingModel.getSingelUserTourPackageBooking({ user_id: id });

    if (!data.length) {
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: this.ResMsg.HTTP_NOT_FOUND,
      };
    }

    const { password_hash, ...rest } = data[0];

    // Calculate total visa due
    const totalVisaDue = visa_booking_data.res.reduce((total, visa) => {
      return total + parseFloat(visa?.invoices?.due);
    }, 0);

    // Calculate total tour due
    const totalTourDue = tour_booking_data.data.reduce((total, tour) => {
      return total + parseFloat(tour?.invoices?.due);
    }, 0);

    // Final total due
    const finalTotalDue = totalVisaDue + totalTourDue;

    // Helper method for summary by status
    const getSummaryByStatus = (data: any, field: any) => {
      return data.reduce((acc: any, item: any) => {
        const status = item[field] || "UNKNOWN";
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});
    };

    // Helper method for summary by field
    const getSummaryByField = (data: any, field: any) => {
      return data.reduce((acc: any, item: any) => {
        const value = item[field] || "UNKNOWN";
        acc[value] = (acc[value] || 0) + 1;
        return acc;
      }, {});
    };

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data: rest,
      total_visa_booking: visa_booking_data.res.length
        ? visa_booking_data.total
        : 0,
      visa_booking: visa_booking_data.res.length ? visa_booking_data.res : [],
      total_tour_booking: tour_booking_data.data.length
        ? tour_booking_data.total
        : 0,
      tour_booking: tour_booking_data.data.length ? tour_booking_data.data : [],
      total_visa_due: totalVisaDue.toFixed(2),
      total_tour_due: totalTourDue.toFixed(2),
      final_total_due: finalTotalDue.toFixed(2),

      insights: {
        visa_status_summary: getSummaryByStatus(
          visa_booking_data.res,
          "status"
        ),
        // top_visa_types: getSummaryByField(visa_booking_data.res, 'type'),
        // visa_fee_summary: visa_booking_data.res
        //   .reduce((total, visa) => {
        //     return total + parseFloat(visa.visa_fee);
        //   }, 0)
        //   .toFixed(2),
        tour_status_summary: getSummaryByStatus(
          tour_booking_data.data,
          "status"
        ),
      },
    };
  }

  //edit user profile
  public async editUserProfile(req: Request) {
    const { id } = req.params;
    const files = (req.files as Express.Multer.File[]) || [];
    if (files?.length) {
      req.body[files[0].fieldname] = files[0].filename;
    }
    const { username, first_name, last_name, gender, photo, status, email, phone_number, password } = req.body;
    const model = this.Model.userModel();
    if (username) {
      const check_username = await model.getProfileDetails({
        username: username,
      });
      if (check_username.length) {
        if (Number(check_username[0].id) !== Number(id)) {
          return {
            success: false,
            code: this.StatusCode.HTTP_CONFLICT,
            message: this.ResMsg.USERNAME_EXISTS,
          };
        }
      }
    }

    if (email) {
      const check_email = await model.getProfileDetails({
        email: email,
      });
      if (check_email.length) {
        if (Number(check_email[0].id) !== Number(id)) {
          return {
            success: false,
            code: this.StatusCode.HTTP_CONFLICT,
            message: this.ResMsg.EMAIL_EXISTS,
          };
        }
      }
    }

    if (phone_number) {
      const check_number = await model.getProfileDetails({
        phone_number: phone_number,
      });
      if (check_number.length) {
        if (Number(check_number[0].id) !== Number(id)) {
          return {
            success: false,
            code: this.StatusCode.HTTP_CONFLICT,
            message: this.ResMsg.PHONE_EXISTS,
          };
        }
      }
    }

    let password_hash = undefined;
    if (password) {
      password_hash = await Lib.hashPass(password);
    }

    const update_profile = await model.updateProfile(
      { username, first_name, last_name, gender, photo, status, email, phone_number, password_hash, password },
      { id: Number(id) }
    );
    if (update_profile) {
      //send email to admin
      await Lib.sendEmail(
        [PROJECT_EMAIL_OTHERS_1],
        `B2C user has been updated`,
        email_template_to_send_notification({
          title: "B2C user has been updated",
          details: {
            details: `B2C user has been updated`
          }
        })
      );
      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.HTTP_OK,
        data: req.body,
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
