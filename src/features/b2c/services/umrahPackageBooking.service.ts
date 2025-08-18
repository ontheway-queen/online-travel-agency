import AbstractServices from '../../../abstract/abstract.service';
import { Request } from 'express';
import { PROJECT_CODE } from '../../../utils/miscellaneous/constants';

export class UmrahPackageBookingService extends AbstractServices {
  constructor() {
    super();
  }

  //Insert Umrah Package Booking Service
  public async umrahPackageBooking(req: Request) {
    return this.db.transaction(async (trx) => {
      const bookingModel = this.Model.umrahPackageBookinModel(trx);
      const packageModel = this.Model.umrahPackageModel(trx);
      const paymentModel = this.Model.paymentModel(trx);
      const { booking_info, umrah_id, ...rest } = req.body;
      const { id: user_id } = req.user;
      const umrahPackage = await packageModel.getSingleUmrahPackage(umrah_id);

      rest['user_id'] = user_id;
      rest['price_per_person'] = umrahPackage.b2c_price_per_person;
      rest['discount'] = umrahPackage.b2c_discount;
      rest['discount_type'] = umrahPackage.b2c_discount_type;

      if (!umrahPackage)
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: this.ResMsg.HTTP_NOT_FOUND,
        };

      const { b2c_price_per_person, b2c_discount, b2c_discount_type } =
        umrahPackage;

      const price = Number(b2c_price_per_person) * Number(rest.traveler_adult);

      const new_price =
        b2c_discount_type === 'FLAT'
          ? Number(price) - Number(b2c_discount)
          : Number(price) - (Number(price) * Number(b2c_discount)) / 100;

      const umrah_package_booking = await bookingModel.umrahPackageInsert({
        user_id,
        umrah_id,
        traveler_adult: rest.traveler_adult,
        traveler_child: rest.traveler_child,
        note_from_customer: rest.note_from_customer,
        travel_date: rest.travel_date,
        double_room: rest.double_room,
        twin_room: rest.twin_room,
        price_per_person: b2c_price_per_person,
        discount: b2c_discount,
        discount_type: b2c_discount_type,
      });

      const booking_id = Number(umrah_package_booking[0].id);

      await bookingModel.insertUmrahPackageBookingContact({
        booking_id,
        ...booking_info,
      });

      const invoice_data = await paymentModel.getInvoice({ limit: 1 });

      let invoice_number: any = 0;

      if (invoice_data.data.length) {
        invoice_number = Number(
          invoice_data.data[0].invoice_number.split('-')[1]
        );
      } else {
        invoice_number = 0;
      }

      invoice_number =
        `${PROJECT_CODE}IC` + (invoice_number + 1).toString().padStart(7, '0');

      await paymentModel.insertInvoice({
        user_id,
        ref_id: booking_id,
        ref_type: 'umrah',
        total_amount: new_price,
        due: new_price,
        details: `Invoice has been created for umrah application id ${booking_id}`,
        invoice_number,
      });

      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.HTTP_OK,
      };
    });
  }

  //user's booking history list
  public async getMyBookingHistory(req: Request) {
    const { id: user_id } = req.user;
    const { limit, skip } = req.query as unknown as {
      limit: number;
      skip: number;
    };

    const model = this.Model.umrahPackageBookinModel();

    const { history, historyCount } = await model.getMyBookingHistory({
      user_id,
      limit,
      skip,
    });

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      total: historyCount[0].count,
      data: history,
    };
  }



   //user's Single booking
   public async getSingleBooking(req: Request) {
    const {id} = req.params


    const model = this.Model.umrahPackageBookinModel();

    const data = await model.getSingleBooking(Number(id));

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      data: data,
    };
  }
}
