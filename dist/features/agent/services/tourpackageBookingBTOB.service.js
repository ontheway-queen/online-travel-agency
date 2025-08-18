"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const abstract_service_1 = __importDefault(require("../../../abstract/abstract.service"));
const constants_1 = require("../../../utils/miscellaneous/constants");
const adminNotificationSubService_1 = require("../../admin/services/subServices/adminNotificationSubService");
class TourPackageBookingBTOBService extends abstract_service_1.default {
    //create user's tour package booking
    createTourPackageBooking(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { id: user_id, agency_id } = req.agency;
                const _a = req.body, { booking_info } = _a, rest = __rest(_a, ["booking_info"]);
                const data = yield this.Model.tourPackageModel().getSingleTourPackage(req.body.tour_id);
                if (!data.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: "Tour is not available",
                    };
                }
                rest["created_by"] = user_id;
                rest["agency_id"] = agency_id;
                rest["adult_price"] = data[0].b2b_adult_price;
                rest["child_price"] = data[0].b2b_child_price;
                rest["discount"] = data[0].b2b_discount;
                rest["discount_type"] = data[0].b2b_discount_type;
                const price = Number(rest.adult_price) * Number(rest.traveler_adult) +
                    Number(rest.child_price) * Number(rest.traveler_child);
                const new_price = rest.discount_type === "FLAT"
                    ? Number(price) - Number(rest.discount)
                    : Number(price) - (Number(price) * Number(rest.discount)) / 100;
                const model = this.Model.tourPackageBookingModel(trx);
                //get booking_ref id & increase the number of entry by one
                const last_entry = yield this.Model.lastServiceEntryModel(trx).getLastRefId({ type: constants_1.INVOICE_TYPE_TOUR });
                const booking_ref_id = `${constants_1.PROJECT_CODE}-T-${(Number(last_entry) + 1).toString().padStart(5, "0")}`;
                rest.booking_ref = booking_ref_id;
                yield this.Model.lastServiceEntryModel(trx).incrementLastRefId({ type: constants_1.INVOICE_TYPE_TOUR });
                const tour_package_info = yield model.insertTourPackageBookB2B(rest);
                booking_info["booking_id"] = tour_package_info[0].id;
                yield model.insertTourPackageBookContactB2B(booking_info);
                //send notification to admin
                const adminNotificationSubService = new adminNotificationSubService_1.AdminNotificationSubService(trx);
                yield adminNotificationSubService.insertNotification({ message: `A new tour booking from B2B. Booking id ${tour_package_info[0].id}`, ref_id: tour_package_info[0].id, type: constants_1.NOTIFICATION_TYPE_B2B_TOUR_BOOKING });
                //create invoice
                //  const paymentModel = this.Model.paymentModel();
                //  const invoice_data = await paymentModel.getInvoice({ limit: 1 });
                //  let invoice_number;
                //  if (invoice_data.data.length) {
                //    invoice_number = Number(
                //      invoice_data.data[0].invoice_number.split('-')[1]
                //    );
                //  } else {
                //    invoice_number = 0;
                //  }
                //  invoice_number =
                //    'online travel agency-' + (invoice_number + 1).toString().padStart(7, '0');
                //  await paymentModel.insertInvoice({
                //    user_id,
                //    ref_id: tour_package_info[0].id,
                //    ref_type: 'tour',
                //    total_amount: new_price,
                //    due: new_price,
                //    details: `Invoice has been created for tour application id ${tour_package_info[0].id}`,
                //    invoice_number,
                //  });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: "Booking Confirmed Successfully",
                };
            }));
        });
    }
    //user's booking history list
    getMyBookingHistory(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id, agency_id } = req.agency;
            const { from_travel_date, to_travel_date, title, status, limit, skip } = req.query;
            const model = this.Model.tourPackageBookingModel();
            const { data, total } = yield model.getAllTourPackageBookingB2B({
                from_travel_date,
                to_travel_date,
                title,
                agency_id,
                status,
                limit,
                skip,
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                total,
                data: data,
            };
        });
    }
    //single booking info
    getSingleBookingInfo(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { agency_id } = req.agency;
            const booking_id = Number(req.params.id);
            const model = this.Model.tourPackageBookingModel();
            const data = yield model.getSingleBookingInfoB2B(booking_id, agency_id);
            if (!data) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.ResMsg.HTTP_NOT_FOUND,
                };
            }
            const tour_id = data === null || data === void 0 ? void 0 : data.tour_id;
            const photos = yield this.Model.tourPackageModel().getTourPhotos(tour_id);
            const include_services = yield this.Model.tourPackageModel().getTourServices(tour_id, constants_1.TOUR_PACKAGE_INCLUDE_SERVICE);
            const exclude_services = yield this.Model.tourPackageModel().getTourServices(tour_id, constants_1.TOUR_PACKAGE_EXCLUDE_SERVICE);
            const highlight_services = yield this.Model.tourPackageModel().getTourServices(tour_id, constants_1.TOUR_PACKAGE_HIGHLIGHT_SERVICE);
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data: Object.assign(Object.assign({}, data), { photos,
                    include_services,
                    exclude_services,
                    highlight_services }),
            };
        });
    }
}
exports.default = TourPackageBookingBTOBService;
