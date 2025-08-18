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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminUmrahPackageBookingService = void 0;
const abstract_service_1 = __importDefault(require("../../../abstract/abstract.service"));
class AdminUmrahPackageBookingService extends abstract_service_1.default {
    constructor() {
        super();
    }
    //get tour package list
    getAllUmrahPackageBooking(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { from_travel_date, to_travel_date, title, user_name, status, user_id, limit, skip, } = req.query;
            const model = this.Model.umrahPackageBookinModel();
            const { data, total } = yield model.getAllUmrahPackageBooking({
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
    updateUmrahPackage(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const booking_id = Number(req.params.id);
                const { status } = req.body;
                const model = this.Model.umrahPackageBookinModel(trx);
                //update single booking
                if (status) {
                    yield model.updateSingleBooking(booking_id, { status: status });
                }
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: "Booking Updated Successfully",
                };
            }));
        });
    }
    //single booking info
    getSingleBookingInfo(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const booking_id = Number(req.params.id);
            const model = this.Model.umrahPackageBookinModel();
            const data = yield model.getSingleBooking(booking_id);
            if (!data) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.ResMsg.HTTP_NOT_FOUND,
                };
            }
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data: data
            };
        });
    }
}
exports.AdminUmrahPackageBookingService = AdminUmrahPackageBookingService;
