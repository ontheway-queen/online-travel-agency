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
exports.UmrahPackageBookingService = void 0;
const abstract_service_1 = __importDefault(require("../../../abstract/abstract.service"));
const constants_1 = require("../../../utils/miscellaneous/constants");
class UmrahPackageBookingService extends abstract_service_1.default {
    constructor() {
        super();
    }
    //Insert Umrah Package Booking Service
    umrahPackageBooking(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const bookingModel = this.Model.umrahPackageBookinModel(trx);
                const packageModel = this.Model.umrahPackageModel(trx);
                const paymentModel = this.Model.paymentModel(trx);
                const _a = req.body, { booking_info, umrah_id } = _a, rest = __rest(_a, ["booking_info", "umrah_id"]);
                const { id: user_id } = req.user;
                const umrahPackage = yield packageModel.getSingleUmrahPackage(umrah_id);
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
                const { b2c_price_per_person, b2c_discount, b2c_discount_type } = umrahPackage;
                const price = Number(b2c_price_per_person) * Number(rest.traveler_adult);
                const new_price = b2c_discount_type === 'FLAT'
                    ? Number(price) - Number(b2c_discount)
                    : Number(price) - (Number(price) * Number(b2c_discount)) / 100;
                const umrah_package_booking = yield bookingModel.umrahPackageInsert({
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
                yield bookingModel.insertUmrahPackageBookingContact(Object.assign({ booking_id }, booking_info));
                const invoice_data = yield paymentModel.getInvoice({ limit: 1 });
                let invoice_number = 0;
                if (invoice_data.data.length) {
                    invoice_number = Number(invoice_data.data[0].invoice_number.split('-')[1]);
                }
                else {
                    invoice_number = 0;
                }
                invoice_number =
                    `${constants_1.PROJECT_CODE}IC` + (invoice_number + 1).toString().padStart(7, '0');
                yield paymentModel.insertInvoice({
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
            }));
        });
    }
    //user's booking history list
    getMyBookingHistory(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id: user_id } = req.user;
            const { limit, skip } = req.query;
            const model = this.Model.umrahPackageBookinModel();
            const { history, historyCount } = yield model.getMyBookingHistory({
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
        });
    }
    //user's Single booking
    getSingleBooking(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const model = this.Model.umrahPackageBookinModel();
            const data = yield model.getSingleBooking(Number(id));
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data: data,
            };
        });
    }
}
exports.UmrahPackageBookingService = UmrahPackageBookingService;
