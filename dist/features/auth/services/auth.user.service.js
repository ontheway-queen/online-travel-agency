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
const googleAuth_1 = __importDefault(require("../../../utils/otherAuth/googleAuth"));
const fbAuth_1 = require("../../../utils/otherAuth/fbAuth");
const registrationTemplate_1 = require("../../../utils/templates/registrationTemplate");
const constants_1 = require("../../../utils/miscellaneous/constants");
const sendEmailOtp_1 = require("../../../utils/templates/sendEmailOtp");
class UserAuthService extends abstract_service_1.default {
    //registration service
    registrationService(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const files = req.files || [];
                if (files === null || files === void 0 ? void 0 : files.length) {
                    req.body[files[0].fieldname] = files[0].filename;
                }
                const _a = req.body, { password, email, phone_number } = _a, rest = __rest(_a, ["password", "email", "phone_number"]);
                const model = this.Model.userModel(trx);
                //check users email and phone number and username
                const check_user = yield model.getProfileDetails({
                    email,
                    phone_number,
                });
                if (check_user.length) {
                    if (check_user[0].email === email) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_BAD_REQUEST,
                            message: this.ResMsg.EMAIL_EXISTS,
                        };
                    }
                    else {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_BAD_REQUEST,
                            message: this.ResMsg.PHONE_EXISTS,
                        };
                    }
                }
                let username = lib_1.default.generateUsername(`${rest.first_name} ${rest.last_name}`);
                let suffix = 1;
                while ((yield model.getProfileDetails({ username })).length) {
                    username = `${username}${suffix}`;
                    suffix += 1;
                }
                rest.email = email;
                rest.phone_number = phone_number;
                rest.username = username;
                rest.password = password;
                //send otp
                const commonModel = this.Model.commonModel(trx);
                const checkOtp = yield commonModel.getOTP({ email, type: constants_1.OTP_TYPE_VERIFY_USER });
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
                    type: constants_1.OTP_TYPE_VERIFY_USER,
                });
                lib_1.default.sendEmail(email, 'Registration Verification Code', (0, sendEmailOtp_1.sendEmailOtpTemplate)(otp, 'registration'));
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: 'An OTP has been sent to your login email address',
                    data: {
                        email: email,
                        payload: rest,
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
                    type: constants_1.OTP_TYPE_VERIFY_USER,
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
                    //insert
                    //password hashing
                    const hashedPass = yield lib_1.default.hashPass(payload.password);
                    //register user
                    const registration = yield this.Model.userModel(trx).registerUser(Object.assign({ password_hash: hashedPass }, payload));
                    //retrieve token data
                    const tokenData = {
                        id: registration[0].id,
                        username: payload.username,
                        first_name: payload.first_name,
                        last_name: payload.last_name,
                        gender: payload.gender,
                        email: payload.email,
                        phone_number: payload.phone_number,
                        photo: payload.photo,
                        is_verified: false,
                        status: true,
                        create_date: new Date(),
                    };
                    const token = lib_1.default.createToken(tokenData, config_1.default.JWT_SECRET_USER, '48h');
                    if (registration.length) {
                        yield lib_1.default.sendEmail(email, 'Welcome to online travel agency!', (0, registrationTemplate_1.registrationTemplate)({ name: payload.first_name + ' ' + payload.last_name }));
                        yield lib_1.default.sendEmail([constants_1.PROJECT_EMAIL_OTHERS_1], 'New registration for b2c', (0, registrationTemplate_1.registrationTemplate)({ name: payload.first_name + ' ' + payload.last_name }));
                        return {
                            success: true,
                            code: this.StatusCode.HTTP_SUCCESSFUL,
                            message: this.ResMsg.HTTP_SUCCESSFUL,
                            data: Object.assign({}, tokenData),
                            token,
                        };
                    }
                    else {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_BAD_REQUEST,
                            message: this.ResMsg.HTTP_BAD_REQUEST,
                        };
                    }
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
    //registration service
    loginWithGoogle(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { accessToken, name, email, image } = req.body; // Assuming the token is sent in the request body
                // console.log({ accessToken });
                if (!accessToken) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_UNAUTHORIZED,
                        message: 'Access token required',
                    };
                }
                // Verify Google access token
                const user = yield new googleAuth_1.default().verifyAccessToken(accessToken);
                // console.log({ user });
                const model = this.Model.userModel(trx);
                //check users email and phone number and username
                const check_user = yield model.getProfileDetails({
                    email,
                });
                let userId = check_user.length ? check_user[0].id : 0;
                if (!check_user.length) {
                    //register user
                    const registration = yield model.registerUser({
                        first_name: name,
                        email,
                    });
                    // console.log({ registration });
                    userId = registration[0].id;
                }
                //retrieve token data
                const tokenData = {
                    id: userId,
                    first_name: name,
                    email,
                    photo: check_user.length ? check_user[0].photo : null,
                    is_verified: true,
                    status: true,
                };
                const token = lib_1.default.createToken(tokenData, config_1.default.JWT_SECRET_USER, '48h');
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_OK,
                    data: tokenData,
                    token,
                };
            }));
        });
    }
    //registration service
    loginWithFB(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { accessToken, name, email, image } = req.body; // Assuming the token is sent in the request body
                if (!accessToken) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_UNAUTHORIZED,
                        message: 'Access token required',
                    };
                }
                // Verify Google access token
                const user = yield (0, fbAuth_1.verifyFacebookToken)(accessToken);
                const model = this.Model.userModel(trx);
                //check users email and phone number and username
                const check_user = yield model.getProfileDetails({
                    email: user.email,
                });
                let userId = check_user.length && check_user[0].id;
                if (!check_user.length) {
                    //register user
                    const registration = yield model.registerUser({
                        first_name: name,
                        email,
                    });
                    userId = registration[0].id;
                }
                //retrieve token data
                const tokenData = {
                    id: userId,
                    first_name: name,
                    email,
                    photo: check_user.length ? check_user[0].photo : null,
                    is_verified: true,
                    status: true,
                };
                const token = lib_1.default.createToken(tokenData, config_1.default.JWT_SECRET_USER, '48h');
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_OK,
                    token,
                    data: tokenData,
                };
            }));
        });
    }
    //login
    loginService(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, password } = req.body;
            const model = this.Model.userModel();
            const checkUser = yield model.getProfileDetails({ email });
            if (!checkUser.length) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_BAD_REQUEST,
                    message: this.ResMsg.WRONG_CREDENTIALS,
                };
            }
            // console.log({ checkUser });
            const _a = checkUser[0], { password_hash: hashPass } = _a, rest = __rest(_a, ["password_hash"]);
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
                    message: 'Your account has been disabled',
                };
            }
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
            const token = lib_1.default.createToken(token_data, config_1.default.JWT_SECRET_USER, '48h');
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.LOGIN_SUCCESSFUL,
                data: rest,
                token,
            };
        });
    }
    //forget pass
    forgetPassword(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { token, email, password } = req.body;
            const token_verify = lib_1.default.verifyToken(token, config_1.default.JWT_SECRET_USER);
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
                const model = this.Model.userModel();
                const get_user = yield model.getProfileDetails({ email });
                yield model.updateProfile({ password_hash: hashed_pass }, { id: get_user[0].id });
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
exports.default = UserAuthService;
