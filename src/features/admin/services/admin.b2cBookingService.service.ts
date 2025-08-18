import { Request } from "express";
import AbstractServices from "../../../abstract/abstract.service";
import Lib from "../../../utils/lib/lib";
import { BookingSupportTemplate } from "../../../utils/templates/bookingSupportTemplate";
import { booking_support_status, PROJECT_EMAIL_OTHERS_1, PROJECT_NAME } from "../../../utils/miscellaneous/constants";
import {
  FLIGHT_BOOKING_REFUNDED,
  FLIGHT_BOOKING_REISSUED,
  FLIGHT_BOOKING_VOID
} from "../../../utils/miscellaneous/flightMiscellaneous/flightConstants";
import { email_template_to_send_notification } from "../../../utils/templates/adminNotificationTemplate";
export class AdminBtoCBookingService extends AbstractServices {
  constructor() {
    super();
  }
  //get list
  public async getList(req: Request) {
    const { limit, skip, status } = req.query as unknown as {
      limit: number;
      skip: number;
      status: string;
    };
    const model = this.Model.btocBookingSupportModel();
    const data = await model.getList(undefined, status, limit, skip);
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      total: data.total,
      data: data.data,
    };
  }

  //get details
  public async getDetails(req: Request) {
    const { limit, skip } = req.query as unknown as {
      limit: number;
      skip: number;
    };
    const { id: support_id } = req.params;
    const model = this.Model.btocBookingSupportModel();
    const support_data = await model.getSingleSupport({
      id: Number(support_id),
    });
    if (!support_data.length) {
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: this.ResMsg.HTTP_NOT_FOUND,
      };
    }
    const ticket_data = await model.getTickets(Number(support_id));
    const message_data = await model.getMessages({
      limit,
      skip,
      support_id: Number(support_id),
    });
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data: {
        ...support_data[0],
        ...support_data[1],
        ticket_data,
        total_message: message_data.total,
        message_data: message_data.data,
      },
    };
  }

  //create message
  public async createMessage(req: Request) {
    const { id } = req.admin;
    const { id: support_id } = req.params;
    const model = this.Model.btocBookingSupportModel();
    const support_data = await model.getSingleSupport({
      id: Number(support_id),
    });

    const files = (req.files as Express.Multer.File[]) || [];
    const attachments: { type: string; file: string }[] = [];
    if (!files.length && !req.body.message) {
      return {
        success: false,
        code: this.StatusCode.HTTP_BAD_REQUEST,
        message: this.ResMsg.HTTP_BAD_REQUEST,
      };
    }
    if (files?.length) {
      for (const element of files) {
        let type = element.mimetype.split("/")[0];
        if (type === "application") {
          type = "file";
        }
        const file = element.filename;
        attachments.push({ type, file });
      }
    }

    const attachmentsJSON = JSON.stringify(attachments);
    await model.insertSupportMessage({
      support_id: Number(support_id),
      message: req.body.message,
      attachment: attachmentsJSON,
      sender: "admin",
      sender_id: id,
    });
    //update last message time
    await model.updateSupport(
      {
        last_message_at: new Date(),
        status: support_data[0].status === "pending" ? "processing" : undefined,
      },
      Number(support_id)
    );

    const booking_model = this.Model.btocFlightBookingModel();
    const booking_data = await booking_model.getSingleFlightBooking({
      id: Number(support_data[0].booking_id),
    });
    //send mail
    await Lib.sendEmail(
      support_data[0].created_by_email,
      `New incoming message from B2C support for booking id ${booking_data[0].booking_ref} | ${PROJECT_NAME}`,
      BookingSupportTemplate({
        bookingId: booking_data[0].booking_ref,
        supportType: support_data[0].support_type,
        createdBy: support_data[0].created_by,
        createdAt: support_data[0].created_at,
        messages: [
          {
            sender: "Admin",
            sentAt: new Date().toLocaleString(),
            content: req.body.message,
          },
        ],
      })
    );

    //send mail
    await Lib.sendEmail(
      [PROJECT_EMAIL_OTHERS_1],
      `New incoming message from B2C support for booking id ${booking_data[0].booking_ref} | ${PROJECT_NAME}`,
      BookingSupportTemplate({
        bookingId: booking_data[0].booking_ref,
        supportType: support_data[0].support_type,
        createdBy: support_data[0].created_by,
        createdAt: support_data[0].created_at,
        messages: [
          {
            sender: "Admin",
            sentAt: new Date().toLocaleString(),
            content: req.body.message,
          },
        ],
      })
    );

    return {
      success: true,
      code: this.StatusCode.HTTP_SUCCESSFUL,
      message: this.ResMsg.HTTP_SUCCESSFUL,
      data: attachmentsJSON,
    };
  }

  //close support
  public async closeSupport(req: Request) {
    const { id: user_id } = req.admin;
    const { id: support_id } = req.params;
    return this.db.transaction(async (trx) => {
      const model = this.Model.btocBookingSupportModel(trx);
      const booking_model = this.Model.btocFlightBookingModel(trx);
      const support_data = await model.getSingleSupport({
        id: Number(support_id),
      });
      if (!support_data.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: this.ResMsg.HTTP_NOT_FOUND,
        };
      }

      const { refund_amount, status } = req.body;
      if (status === booking_support_status.adjusted) {
        if (support_data[0].support_type === "Refund") {
          await model.updateSupport(
            {
              status,
              refund_amount,
              adjust_at: new Date(),
              adjusted_by: user_id,
            },
            Number(support_id)
          );

          await booking_model.updateBooking(
            {
              status: FLIGHT_BOOKING_REFUNDED,
            },
            support_data[0].booking_id
          );
        } else {
          if (support_data[0].support_type === "DateChange") {
            await booking_model.updateBooking(
              {
                status: FLIGHT_BOOKING_REISSUED,
              },
              support_data[0].booking_id
            );

            await model.updateSupport(
              {
                status,
              },
              Number(support_id)
            );
          } else if (support_data[0].support_type === "VOID") {
            await booking_model.updateBooking(
              {
                status: FLIGHT_BOOKING_VOID,
              },
              support_data[0].booking_id
            );

            await model.updateSupport(
              {
                status,
              },
              Number(support_id)
            );
          }
        }
      } else if (status === booking_support_status.closed || status === booking_support_status.rejected) {
        await model.updateSupport(
          {
            status,
            closed_at: new Date(),
            closed_by: user_id,
          },
          Number(support_id)
        );
      } else {
        await model.updateSupport(
          {
            status,
          },
          Number(support_id)
        );
      }


      //send email to admin
      await Lib.sendEmail(
        [PROJECT_EMAIL_OTHERS_1],
        `B2C Booking support has been closed`,
        email_template_to_send_notification({
          title: "B2C Booking support has been closed",
          details: {
            details: `Booking support id ${support_id} has been closed`
          }
        })
      );

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.HTTP_OK,
      };
    });
  }
}
