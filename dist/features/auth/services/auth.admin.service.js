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
const lib_1 = __importDefault(require("../../../utils/lib/lib"));
const config_1 = __importDefault(require("../../../config/config"));
const constants_1 = require("../../../utils/miscellaneous/constants");
const sendEmailOtp_1 = require("../../../utils/templates/sendEmailOtp");
class AdminAuthService extends abstract_service_1.default {
    //login
    loginService(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                const { email, password } = req.body;
                const model = this.Model.adminModel(trx);
                const checkUser = yield model.getSingleAdmin({ email });
                // console.log(checkUser);
                if (!checkUser.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: this.ResMsg.WRONG_CREDENTIALS,
                    };
                }
                const _b = checkUser[0], { password_hash: hashPass, role_id } = _b, rest = __rest(_b, ["password_hash", "role_id"]);
                const checkPass = yield lib_1.default.compare(password, hashPass);
                if (!checkPass) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: this.ResMsg.WRONG_CREDENTIALS,
                    };
                }
                if (rest.status === false) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_FORBIDDEN,
                        message: "Your account has been disabled",
                    };
                }
                if (((_a = checkUser[0]) === null || _a === void 0 ? void 0 : _a.twoFA) === 1) {
                    const commonModel = this.Model.commonModel(trx);
                    const checkOtp = yield commonModel.getOTP({ email, type: constants_1.OTP_TYPE_ADMIN_2FA });
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
                        type: constants_1.OTP_TYPE_ADMIN_2FA,
                    });
                    lib_1.default.sendEmail(checkUser[0].email, 'Login Verification Code', (0, sendEmailOtp_1.sendEmailOtpTemplate)(otp, 'login'));
                    return {
                        success: true,
                        code: this.StatusCode.HTTP_OK,
                        message: 'An OTP has been sent to your login email address',
                        data: {
                            email: checkUser[0].email,
                            twoFA: 1,
                        },
                    };
                }
                const admModel = this.Model.administrationModel(trx);
                const role_permission = yield admModel.getSingleRole({
                    id: parseInt(role_id),
                });
                const token_data = {
                    id: rest.id,
                    username: rest.username,
                    first_name: rest.first_name,
                    last_name: rest.last_name,
                    gender: rest.gender,
                    phone_number: rest.phone_number,
                    role_id: rest.role_id,
                    photo: rest.photo,
                    status: rest.status,
                    email: rest.email,
                };
                const token = lib_1.default.createToken(token_data, config_1.default.JWT_SECRET_ADMIN, "10h");
                req.admin = {
                    id: rest.id,
                    username: rest.username,
                    first_name: rest.first_name,
                    last_name: rest.last_name,
                    gender: rest.gender,
                    phone_number: rest.phone_number,
                    role_id: rest.role_id,
                    photo: rest.photo,
                    status: rest.status,
                    email: rest.email,
                };
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.LOGIN_SUCCESSFUL,
                    data: Object.assign(Object.assign({}, rest), { permissions: role_permission.length ? role_permission[0] : [] }),
                    token,
                };
            }));
        });
    }
    // verify otp
    verifyOTP(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { email, otp } = req.body;
                const commonModel = this.Model.commonModel(trx);
                const checkOtp = yield commonModel.getOTP({ email, type: constants_1.OTP_TYPE_ADMIN_2FA });
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
                    const model = this.Model.adminModel(trx);
                    const checkUser = yield model.getSingleAdmin({ email });
                    const _a = checkUser[0], { role_id } = _a, rest = __rest(_a, ["role_id"]);
                    const administrationModel = this.Model.administrationModel(trx);
                    const role_permission = yield administrationModel.getSingleRole({
                        id: parseInt(role_id),
                    });
                    const token_data = {
                        id: rest.id,
                        username: rest.username,
                        first_name: rest.first_name,
                        last_name: rest.last_name,
                        gender: rest.gender,
                        phone_number: rest.phone_number,
                        role_id: rest.role_id,
                        photo: rest.photo,
                        status: rest.status,
                        email: rest.email,
                    };
                    const token = lib_1.default.createToken(token_data, config_1.default.JWT_SECRET_ADMIN, "10h");
                    req.admin = {
                        id: rest.id,
                        username: rest.username,
                        first_name: rest.first_name,
                        last_name: rest.last_name,
                        gender: rest.gender,
                        phone_number: rest.phone_number,
                        role_id: rest.role_id,
                        photo: rest.photo,
                        status: rest.status,
                        email: rest.email,
                    };
                    return {
                        success: true,
                        code: this.StatusCode.HTTP_OK,
                        message: 'OTP verified successfully. You are now logged in.',
                        data: Object.assign(Object.assign({}, rest), { permissions: role_permission.length ? role_permission[0] : [] }),
                        token,
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
    //resend otp
    resendOTP(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                const { email } = req.body;
                const model = this.Model.adminModel(trx);
                const checkUser = yield model.getSingleAdmin({ email });
                if (((_a = checkUser[0]) === null || _a === void 0 ? void 0 : _a.twoFA) === 1) {
                    const commonModel = this.Model.commonModel(trx);
                    const checkOtp = yield commonModel.getOTP({ email, type: constants_1.OTP_TYPE_ADMIN_2FA });
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
                        type: constants_1.OTP_TYPE_ADMIN_2FA,
                    });
                    lib_1.default.sendEmail(checkUser[0].email, 'Login Verification Code', (0, sendEmailOtp_1.sendEmailOtpTemplate)(otp, 'login'));
                    return {
                        success: true,
                        code: this.StatusCode.HTTP_OK,
                        message: 'An OTP has been sent to your login email address',
                        data: {
                            email: checkUser[0].email,
                            twoFA: 1,
                        },
                    };
                }
                else {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_BAD_REQUEST,
                        message: 'Resend OTP is failed',
                    };
                }
            }));
        });
    }
    //forget pass
    forgetPassword(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { token, email, password } = req.body;
            const token_verify = lib_1.default.verifyToken(token, config_1.default.JWT_SECRET_ADMIN);
            if (!token_verify) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_UNAUTHORIZED,
                    message: this.ResMsg.HTTP_UNAUTHORIZED,
                };
            }
            const { email: verify_email } = token_verify;
            if (email === verify_email) {
                const hashed_pass = yield lib_1.default.hashPass(password);
                const model = this.Model.adminModel();
                const get_admin = yield model.getSingleAdmin({ email });
                yield model.updateUserAdmin({ password_hash: hashed_pass }, { id: get_admin[0].id });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.PASSWORD_CHANGED,
                };
            }
            else {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_FORBIDDEN,
                    message: this.StatusCode.HTTP_FORBIDDEN,
                };
            }
        });
    }
}
exports.default = AdminAuthService;
