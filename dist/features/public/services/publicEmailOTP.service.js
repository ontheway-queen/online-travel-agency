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
const config_1 = __importDefault(require("../../../config/config"));
const lib_1 = __importDefault(require("../../../utils/lib/lib"));
const constants_1 = require("../../../utils/miscellaneous/constants");
const responseMessage_1 = __importDefault(require("../../../utils/miscellaneous/responseMessage"));
const sendEmailOtp_1 = require("../../../utils/templates/sendEmailOtp");
class PublicEmailOTPService extends abstract_service_1.default {
    constructor(trx) {
        super();
        this.trx = trx;
    }
    //send email otp service
    sendOtpToEmailService(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { email, type } = req.body;
                if (type === constants_1.OTP_TYPE_FORGET_USER) {
                    // --check if the user exist
                    const userModel = this.Model.userModel();
                    const checkuser = yield userModel.getProfileDetails({ email });
                    if (!checkuser.length) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_NOT_FOUND,
                            message: 'No user has been found with this email',
                        };
                    }
                }
                else if (type === constants_1.OTP_TYPE_VERIFY_USER) {
                    const userModel = this.Model.userModel();
                    const checkUser = yield userModel.getProfileDetails({ email });
                    if (!checkUser.length || checkUser[0].is_verified) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_NOT_FOUND,
                            message: 'No unverified user found.',
                        };
                    }
                }
                else if (type === constants_1.OTP_TYPE_FORGET_AGENT) {
                    const agentModel = this.Model.agencyModel();
                    const checkAgent = yield agentModel.getSingleUser({ email });
                    if (!checkAgent.length) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_NOT_FOUND,
                            message: 'No user found.',
                        };
                    }
                }
                else if (type === constants_1.OTP_TYPE_TRANSACTION_VERIFY) {
                    const model = this.Model.adminModel(trx);
                    const admin_details = yield model.getSingleAdmin({ email });
                    if (!admin_details.length) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_NOT_FOUND,
                            message: this.ResMsg.NOT_FOUND_USER_WITH_EMAIL,
                        };
                    }
                }
                const commonModel = this.Model.commonModel(trx);
                const checkOtp = yield commonModel.getOTP({ email: email, type: type });
                if (checkOtp.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_GONE,
                        message: this.ResMsg.THREE_TIMES_EXPIRED,
                    };
                }
                const otp = lib_1.default.otpGenNumber(6);
                const hashed_otp = yield lib_1.default.hashPass(otp);
                try {
                    const [send_email] = yield Promise.all([
                        email
                            ? lib_1.default.sendEmail(email, constants_1.OTP_EMAIL_SUBJECT, (0, sendEmailOtp_1.sendEmailOtpTemplate)(otp, constants_1.OTP_FOR))
                            : undefined,
                    ]);
                    if (send_email) {
                        yield commonModel.insertOTP({
                            hashed_otp: hashed_otp,
                            email: email,
                            type: type,
                        });
                        return {
                            success: true,
                            code: this.StatusCode.HTTP_OK,
                            message: this.ResMsg.OTP_SENT,
                            data: {
                                email,
                            },
                        };
                    }
                    else {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_INTERNAL_SERVER_ERROR,
                            message: this.ResMsg.HTTP_INTERNAL_SERVER_ERROR,
                        };
                    }
                }
                catch (error) {
                    console.error('Error sending email or SMS:', error);
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_INTERNAL_SERVER_ERROR,
                        message: this.ResMsg.HTTP_INTERNAL_SERVER_ERROR,
                    };
                }
            }));
        });
    }
    //match email otp service
    matchEmailOtpService(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { email, otp, type } = req.body;
                const commonModel = this.Model.commonModel(trx);
                const userModel = this.Model.userModel(trx);
                const agentModel = this.Model.agencyModel(trx);
                const checkOtp = yield commonModel.getOTP({ email, type });
                if (!checkOtp.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_FORBIDDEN,
                        message: responseMessage_1.default.OTP_EXPIRED,
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
                    //--change it for member
                    let secret = config_1.default.JWT_SECRET_ADMIN;
                    if (type === constants_1.OTP_TYPE_FORGET_USER) {
                        secret = config_1.default.JWT_SECRET_USER;
                    }
                    else if (type === constants_1.OTP_TYPE_VERIFY_USER) {
                        const checkUser = yield userModel.getProfileDetails({ email });
                        if (!checkUser.length || checkUser[0].is_verified) {
                            return {
                                success: false,
                                code: this.StatusCode.HTTP_NOT_FOUND,
                                message: 'No unverified user found.',
                            };
                        }
                        yield userModel.updateProfile({ is_verified: true }, { id: checkUser[0].id });
                        return {
                            success: true,
                            code: this.StatusCode.HTTP_ACCEPTED,
                            message: 'User successfully verified.',
                        };
                    }
                    else if (type === constants_1.OTP_TYPE_FORGET_AGENT) {
                        secret = config_1.default.JWT_SECRET_AGENT;
                    }
                    const token = lib_1.default.createToken({
                        email: email,
                        type: type,
                    }, secret, '5m');
                    return {
                        success: true,
                        code: this.StatusCode.HTTP_ACCEPTED,
                        message: this.ResMsg.OTP_MATCHED,
                        token,
                    };
                }
                else {
                    yield commonModel.updateOTP({
                        tried: tried + 1,
                    }, { id: email_otp_id });
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_FORBIDDEN,
                        message: this.ResMsg.OTP_INVALID,
                    };
                }
            }));
        });
    }
}
exports.default = PublicEmailOTPService;
