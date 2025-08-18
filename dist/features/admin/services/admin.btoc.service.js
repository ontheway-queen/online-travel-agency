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
exports.AdminBtocService = void 0;
const abstract_service_1 = __importDefault(require("../../../abstract/abstract.service"));
const lib_1 = __importDefault(require("../../../utils/lib/lib"));
const constants_1 = require("../../../utils/miscellaneous/constants");
const adminNotificationTemplate_1 = require("../../../utils/templates/adminNotificationTemplate");
class AdminBtocService extends abstract_service_1.default {
    constructor() {
        super();
    }
    //get users
    getUsers(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = this.Model.userModel();
            const data = yield model.getAllUser(req.query, true);
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                data: data.data,
                total: data.total,
            };
        });
    }
    //get user details
    getSingleUser(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = Number(req.params.id);
            const model = this.Model.userModel();
            const visaBookingModel = this.Model.VisaModel();
            const tourBookingModel = this.Model.tourPackageBookingModel();
            const data = yield model.getProfileDetails({ id });
            const visa_booking_data = yield visaBookingModel.getSingleUserVisaApplication({ user_id: id });
            const tour_booking_data = yield tourBookingModel.getSingelUserTourPackageBooking({ user_id: id });
            if (!data.length) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.ResMsg.HTTP_NOT_FOUND,
                };
            }
            const _a = data[0], { password_hash } = _a, rest = __rest(_a, ["password_hash"]);
            // Calculate total visa due
            const totalVisaDue = visa_booking_data.res.reduce((total, visa) => {
                var _a;
                return total + parseFloat((_a = visa === null || visa === void 0 ? void 0 : visa.invoices) === null || _a === void 0 ? void 0 : _a.due);
            }, 0);
            // Calculate total tour due
            const totalTourDue = tour_booking_data.data.reduce((total, tour) => {
                var _a;
                return total + parseFloat((_a = tour === null || tour === void 0 ? void 0 : tour.invoices) === null || _a === void 0 ? void 0 : _a.due);
            }, 0);
            // Final total due
            const finalTotalDue = totalVisaDue + totalTourDue;
            // Helper method for summary by status
            const getSummaryByStatus = (data, field) => {
                return data.reduce((acc, item) => {
                    const status = item[field] || "UNKNOWN";
                    acc[status] = (acc[status] || 0) + 1;
                    return acc;
                }, {});
            };
            // Helper method for summary by field
            const getSummaryByField = (data, field) => {
                return data.reduce((acc, item) => {
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
                    visa_status_summary: getSummaryByStatus(visa_booking_data.res, "status"),
                    // top_visa_types: getSummaryByField(visa_booking_data.res, 'type'),
                    // visa_fee_summary: visa_booking_data.res
                    //   .reduce((total, visa) => {
                    //     return total + parseFloat(visa.visa_fee);
                    //   }, 0)
                    //   .toFixed(2),
                    tour_status_summary: getSummaryByStatus(tour_booking_data.data, "status"),
                },
            };
        });
    }
    //edit user profile
    editUserProfile(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const files = req.files || [];
            if (files === null || files === void 0 ? void 0 : files.length) {
                req.body[files[0].fieldname] = files[0].filename;
            }
            const { username, first_name, last_name, gender, photo, status, email, phone_number, password } = req.body;
            const model = this.Model.userModel();
            if (username) {
                const check_username = yield model.getProfileDetails({
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
                const check_email = yield model.getProfileDetails({
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
                const check_number = yield model.getProfileDetails({
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
                password_hash = yield lib_1.default.hashPass(password);
            }
            const update_profile = yield model.updateProfile({ username, first_name, last_name, gender, photo, status, email, phone_number, password_hash, password }, { id: Number(id) });
            if (update_profile) {
                //send email to admin
                yield lib_1.default.sendEmail([constants_1.PROJECT_EMAIL_OTHERS_1], `B2C user has been updated`, (0, adminNotificationTemplate_1.email_template_to_send_notification)({
                    title: "B2C user has been updated",
                    details: {
                        details: `B2C user has been updated`
                    }
                }));
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_OK,
                    data: req.body,
                };
            }
            else {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_INTERNAL_SERVER_ERROR,
                    message: this.ResMsg.HTTP_INTERNAL_SERVER_ERROR,
                };
            }
        });
    }
}
exports.AdminBtocService = AdminBtocService;
