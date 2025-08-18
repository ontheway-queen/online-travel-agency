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
const abstract_service_1 = __importDefault(require("../../../abstract/abstract.service"));
const lib_1 = __importDefault(require("../../../utils/lib/lib"));
const constants_1 = require("../../../utils/miscellaneous/constants");
const registrationTemplate_1 = require("../../../utils/templates/registrationTemplate");
const sendEmailOtp_1 = require("../../../utils/templates/sendEmailOtp");
class B2bRegistrationRequestService extends abstract_service_1.default {
    // Create B2B registration request
    createRegistrationRequest(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const model = this.Model.b2bRegistrationRequestModel(trx);
                const { name, email, mobile_number, address, postal_code, agency_name, agency_phone, } = req.body;
                const files = req.files || [];
                const existingRequest = yield model.getSingleRegistrationRequest({ email });
                if (existingRequest) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_CONFLICT,
                        message: "A registration request with this email already exists.",
                    };
                }
                // Prepare file fields
                const fileFields = files.reduce((acc, file) => {
                    acc[file.fieldname] = file.filename;
                    return acc;
                }, {
                    agency_logo: "",
                    photo: "",
                    trade_license: "",
                    visiting_card: ""
                });
                // Prepare new payload
                const newPayload = Object.assign({ name,
                    email,
                    mobile_number,
                    address,
                    postal_code, agency_email: email, agency_name,
                    agency_phone }, fileFields);
                //send otp
                const commonModel = this.Model.commonModel(trx);
                const checkOtp = yield commonModel.getOTP({ email, type: constants_1.OTP_TYPE_AGENT_REGISTRATION });
                if (checkOtp.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_FORBIDDEN,
                        message: "Cannot send another OTP before 3 minutes! Please try again later.",
                    };
                }
                const otp = lib_1.default.otpGenNumber(6);
                const hashed_otp = yield lib_1.default.hashPass(otp);
                yield commonModel.insertOTP({
                    hashed_otp: hashed_otp,
                    email: email,
                    type: constants_1.OTP_TYPE_AGENT_REGISTRATION,
                });
                lib_1.default.sendEmail(email, 'Registration Verification Code', (0, sendEmailOtp_1.sendEmailOtpTemplate)(otp, 'registration'));
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: 'An OTP has been sent to your login email address',
                    data: {
                        email: email,
                        payload: newPayload,
                    },
                };
            }));
        });
    }
    verifyRegistrationRequest(email, otp, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const commonModel = this.Model.commonModel(trx);
                const checkOtp = yield commonModel.getOTP({
                    email,
                    type: constants_1.OTP_TYPE_AGENT_REGISTRATION,
                });
                console.log({
                    email,
                    type: constants_1.OTP_TYPE_AGENT_REGISTRATION,
                });
                if (!checkOtp.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_FORBIDDEN,
                        message: this.ResMsg.OTP_EXPIRED,
                    };
                }
                const { id: email_otp_id, otp: hashed_otp, tried } = checkOtp[0];
                if (tried > 3) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_GONE,
                        message: this.ResMsg.TOO_MUCH_ATTEMPT,
                    };
                }
                const otpValidation = yield lib_1.default.compare(otp.toString(), hashed_otp);
                if (otpValidation) {
                    yield commonModel.updateOTP({
                        tried: tried + 1,
                        matched: 1,
                    }, { id: email_otp_id });
                    const model = this.Model.b2bRegistrationRequestModel(trx);
                    yield model.createRegistrationRequest(payload);
                    yield lib_1.default.sendEmail(email, 'Welcome to online travel agency!', (0, registrationTemplate_1.agentRegistrationTemplate)({ name: payload.name }));
                    return {
                        success: true,
                        code: this.StatusCode.HTTP_SUCCESSFUL,
                        message: 'Your B2B registration request has been successfully submitted. Our team will review your request and provide you with further updates. Upon completion of the review, a B2B user account will be created for your agency.',
                    };
                }
                else {
                    yield commonModel.updateOTP({
                        tried: tried + 1,
                    }, { id: email_otp_id });
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_UNAUTHORIZED,
                        message: this.ResMsg.OTP_INVALID,
                    };
                }
            }));
        });
    }
}
exports.default = B2bRegistrationRequestService;
