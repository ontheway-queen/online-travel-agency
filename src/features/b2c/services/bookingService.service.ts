import { Request } from "express";
import AbstractServices from "../../../abstract/abstract.service";
import Lib from "../../../utils/lib/lib";
import {
  NOTIFICATION_TYPE_B2C_BOOKING_SUPPORT,
  PROJECT_EMAIL_API_1,
  PROJECT_NAME,
} from "../../../utils/miscellaneous/constants";
import { BookingSupportTemplate } from "../../../utils/templates/bookingSupportTemplate";
import { AdminNotificationSubService } from "../../admin/services/subServices/adminNotificationSubService";

export class BtoCBookingService extends AbstractServices {
  constructor() {
    super();
  }

  //create support
  public async createSupport(req: Request) {
    return this.db.transaction(async (trx) => {
      const { id, first_name, last_name, username } = req.user;

      const {
        booking_id,
        support_type,
        ticket_number,
        message,
        is_booking_supported,
      } = req.body;

      const booking_model = this.Model.btocFlightBookingModel(trx);
      let booking_ref;
      if (booking_id) {
        const booking_data = await booking_model.getSingleFlightBooking({
          id: Number(booking_id),
          user_id: id,
        });

        if (!booking_data.length) {
          return {
            success: false,
            code: this.StatusCode.HTTP_NOT_FOUND,
            message: this.ResMsg.HTTP_NOT_FOUND,
          };
        }
        booking_ref = booking_data[0].booking_ref;
      }

      const support_model = this.Model.btocBookingSupportModel(trx);

      // insert support
      const support_res = await support_model.insertSupport({
        booking_id: booking_id ? Number(booking_id) : undefined,
        user_id: Number(id),
        support_type,
        created_by: id,
        is_booking_supported,
      });

      const ticket_body = ticket_number?.map((element: any) => {
        return {
          support_id: support_res[0].id,
          traveler_id: element.traveler_id,
          ticket_number: element.ticket_number,
        };
      });

      if (ticket_body && ticket_body.length > 0) {
        // insert support ticket
        await support_model.insertSupportTicket(ticket_body);
      }

      const files = (req.files as Express.Multer.File[]) || [];
      const attachments: { type: string; file: string }[] = [];
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

      // insert support message
      await support_model.insertSupportMessage({
        support_id: support_res[0].id,
        message,
        attachment: attachmentsJSON,
        sender: "user",
        sender_id: id,
      });

      //send mail
      await Lib.sendEmail(
        PROJECT_EMAIL_API_1,
        `B2C Support Created for booking id ${booking_ref} | ${PROJECT_NAME}`,
        BookingSupportTemplate({
          bookingId: booking_ref,
          supportType: support_type,
          createdBy: username,
          createdAt: new Date().toLocaleString(),
          messages: [
            {
              sender: username,
              sentAt: new Date().toLocaleString(),
              content: message,
            },
          ],
        })
      );

      //send notification to admin
      const adminNotificationSubService = new AdminNotificationSubService(trx);
      await adminNotificationSubService.insertNotification({
        message: `A new support has been created from B2C.`,
        ref_id: support_res[0].id,
        type: NOTIFICATION_TYPE_B2C_BOOKING_SUPPORT,
      });

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: this.ResMsg.HTTP_SUCCESSFUL,
        data: { id: support_res[0].id, attachmentsJSON },
      };
    });
  }

  //get list
  public async getList(req: Request) {
    const { id: user_id } = req.user;
    const { limit, skip, status } = req.query as unknown as {
      limit: number;
      skip: number;
      status: string;
    };
    const model = this.Model.btocBookingSupportModel();
    const data = await model.getList(user_id, status, limit, skip);

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      total: data.total,
      data: data.data,
    };
  }

  //get details
  public async getDetails(req: Request) {
    const { id: user_id } = req.user;
    const { limit, skip } = req.query as unknown as {
      limit: number;
      skip: number;
    };
    const { id: support_id } = req.params;
    const model = this.Model.btocBookingSupportModel();

    const support_data = await model.getSingleSupport({
      id: Number(support_id),
      user_id,
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
        ticket_data,
        total_message: message_data.total,
        message_data: message_data.data,
      },
    };
  }

  //create message
  public async createMessage(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { id, username } = req.user;
      const { id: support_id } = req.params;
      const model = this.Model.btocBookingSupportModel(trx);
      const support_data = await model.getSingleSupport({
        id: Number(support_id),
        user_id: Number(id),
        notStatus: "closed",
      });
      if (!support_data.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_BAD_REQUEST,
          message: this.ResMsg.HTTP_BAD_REQUEST,
        };
      }
      const files = (req.files as Express.Multer.File[]) || [];
      const attachments: { type: string; file: string }[] = [];
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
        sender: "user",
        sender_id: id,
      });

      //update last message time
      await model.updateSupport(
        { last_message_at: new Date() },
        Number(support_id)
      );

      const booking_model = this.Model.btocFlightBookingModel(trx);
      const booking_data = await booking_model.getSingleFlightBooking({
        id: Number(support_data[0].booking_id),
      });
      //send mail
      await Lib.sendEmail(
        PROJECT_EMAIL_API_1,
        `New incoming message from B2C support for booking id ${booking_data[0].booking_ref} | ${PROJECT_NAME}`,
        BookingSupportTemplate({
          bookingId: booking_data[0].booking_ref,
          supportType: support_data[0].support_type,
          createdBy: username,
          createdAt: support_data[0].created_at,
          messages: [
            {
              sender: username,
              sentAt: new Date().toLocaleString(),
              content: req.body.message,
            },
          ],
        })
      );

      //send notification to admin
      const adminNotificationSubService = new AdminNotificationSubService(trx);
      await adminNotificationSubService.insertNotification({
        message: `A new incoming message from B2C booking support - ${req.body.message}`,
        ref_id: Number(support_id),
        type: NOTIFICATION_TYPE_B2C_BOOKING_SUPPORT,
      });

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: this.ResMsg.HTTP_SUCCESSFUL,
        data: attachmentsJSON,
      };
    })
  }
}
