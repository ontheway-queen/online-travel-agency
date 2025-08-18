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
exports.AdminTourPackageBookingService = void 0;
const abstract_service_1 = __importDefault(require("../../../abstract/abstract.service"));
const constants_1 = require("../../../utils/miscellaneous/constants");
class AdminTourPackageBookingService extends abstract_service_1.default {
    constructor() {
        super();
    }
    //get tour package list
    getAllTourPackageBooking(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { from_travel_date, to_travel_date, title, user_name, status, user_id, limit, skip, } = req.query;
            const model = this.Model.tourPackageBookingModel();
            const { data, total } = yield model.getAllTourPackageBooking({
                from_travel_date,
                to_travel_date,
                title,
                user_name,
                user_id,
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
    //update tour package booking
    updateTourPackage(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const booking_id = Number(req.params.id);
                const _a = req.body, { booking_info } = _a, rest = __rest(_a, ["booking_info"]);
                const model = this.Model.tourPackageBookingModel(trx);
                //update single booking
                if (rest) {
                    yield model.updateSingleBooking(booking_id, rest);
                }
                //update single booking user info
                if (booking_info) {
                    yield model.updateSingleBookingContact(booking_id, booking_info);
                }
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: 'Booking Updated Successfully',
                };
            }));
        });
    }
    //single booking info
    getSingleBookingInfo(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const booking_id = Number(req.params.id);
            const model = this.Model.tourPackageBookingModel();
            const paymentModel = this.Model.paymentModel();
            const data = yield model.getSingleBookingInfo(booking_id);
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
            const invoice_data = yield paymentModel.getInvoiceByBookingId(Number(booking_id), 'tour');
            const payment_data = yield paymentModel.singleMoneyReceipt(invoice_data[0].id);
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data: Object.assign(Object.assign({}, data), { invoice_data,
                    payment_data,
                    photos,
                    include_services,
                    exclude_services,
                    highlight_services }),
            };
        });
    }
    //get tour package list b2b
    getAllTourPackageBookingB2B(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { from_travel_date, to_travel_date, title, status, limit, skip } = req.query;
            const model = this.Model.tourPackageBookingModel();
            const { data, total } = yield model.getAllTourPackageBookingB2B({
                from_travel_date,
                to_travel_date,
                title,
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
    //single booking info b2b
    getSingleBookingInfoB2B(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const booking_id = Number(req.params.id);
            const model = this.Model.tourPackageBookingModel();
            const data = yield model.getSingleBookingInfoB2B(booking_id);
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
    //update tour package booking b2b
    updateTourPackageB2B(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const booking_id = Number(req.params.id);
                const { status } = req.body;
                const model = this.Model.tourPackageBookingModel(trx);
                const agencyModel = this.Model.agencyModel(trx);
                const data = yield model.getSingleBookingInfoB2B(booking_id);
                //update single booking
                if (data.status == 'PENDING') {
                    if (status === 'APPROVED') {
                        const data = yield model.getSingleBookingInfoB2B(booking_id);
                        //check balance
                        const balance = yield agencyModel.getTotalBalance(data.agency_id);
                        const price = Number(data.adult_price) * Number(data.traveler_adult) +
                            Number(data.child_price) * Number(data.traveler_child);
                        const new_price = data.discount_type === 'FLAT'
                            ? Number(price) - Number(data.discount)
                            : Number(price) - (Number(price) * Number(data.discount)) / 100;
                        if (Number(new_price) > Number(balance)) {
                            return {
                                success: false,
                                code: this.StatusCode.HTTP_BAD_REQUEST,
                                message: 'There is insufficient balance in agency account',
                            };
                        }
                        //debit amount
                        yield agencyModel.insertAgencyLedger({
                            agency_id: data.agency_id,
                            type: 'debit',
                            amount: new_price,
                            details: `Debit for tour booking - Booking ID: ${booking_id}.`,
                        });
                    }
                    yield model.updateSingleBookingB2B(booking_id, { status: status });
                }
                else {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: 'Booking is already approved or cancelled',
                    };
                }
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: 'Booking Updated Successfully',
                };
            }));
        });
    }
}
exports.AdminTourPackageBookingService = AdminTourPackageBookingService;
