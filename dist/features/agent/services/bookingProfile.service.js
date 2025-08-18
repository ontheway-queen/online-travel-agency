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
const customError_1 = __importDefault(require("../../../utils/lib/customError"));
class BookingProfileService extends abstract_service_1.default {
    //get profile
    getProfile(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                var _a, _b;
                const { id, agency_id } = req.agency;
                const model = this.Model.agencyModel(trx);
                const checkUser = yield model.getSingleUser({ id });
                if (!checkUser.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND,
                    };
                }
                const _c = checkUser[0], { hashed_password, role_id } = _c, rest = __rest(_c, ["hashed_password", "role_id"]);
                const agency_model = this.Model.agencyModel(trx);
                const balance = yield agency_model.getTotalBalance(agency_id);
                rest.balance = balance;
                const agencyAdmModel = this.Model.btobAdministrationModel(trx);
                let role_permission = [];
                if (role_id) {
                    role_permission = yield agencyAdmModel.getSingleRole({
                        id: parseInt(role_id),
                        agency_id,
                    });
                }
                const agency_details = yield agency_model.getSingleAgency(agency_id);
                if (agency_details[0].kam) {
                    const getKAM = yield this.Model.adminModel(trx).getSingleAdmin({
                        id: agency_details[0].kam,
                    });
                    if (getKAM.length) {
                        (rest.kam_name = getKAM[0].first_name + " " + getKAM[0].last_name),
                            (rest.kam_email = getKAM[0].email),
                            (rest.kam_phone_number = getKAM[0].phone_number);
                    }
                }
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_OK,
                    data: Object.assign(Object.assign({ role_id }, rest), { address: (_a = agency_details[0]) === null || _a === void 0 ? void 0 : _a.address, agency_logo: (_b = agency_details[0]) === null || _b === void 0 ? void 0 : _b.agency_logo, permissions: role_permission.length ? role_permission[0] : [] }),
                };
            }));
        });
    }
    //edit profile
    editProfile(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { id, agency_id } = req.agency;
                const files = req.files || [];
                const body = req.body;
                const model = this.Model.agencyModel();
                const checkAgency = yield model.getSingleAgency(agency_id);
                if (body.agency_email && body.agency_email !== checkAgency[0].email) {
                    const checkMail = yield model.checkAgency({
                        email: body.agency_email,
                    });
                    if (checkMail.data.length) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_CONFLICT,
                            message: "The email address already exists",
                        };
                    }
                }
                for (const file of files) {
                    console.log({ file });
                    if (file.fieldname === "agency_logo" || file.fieldname === "photo") {
                        body[file.fieldname] = file.filename;
                    }
                    else {
                        throw new customError_1.default("Unknown file name", this.StatusCode.HTTP_CONFLICT, "WARNING");
                    }
                }
                const agencyBody = {
                    agency_name: body.agency_name,
                    email: body.agency_email,
                    phone: body.agency_phone,
                    address: body.agency_address,
                    agency_logo: body.agency_logo,
                };
                const userBody = {
                    name: body.name,
                    mobile_number: body.mobile_number,
                    twoFA: body.twoFA,
                    photo: body.photo,
                };
                yield model.updateAgencyUser(userBody, id);
                yield model.updateAgency(agencyBody, agency_id);
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_OK,
                    data: req.body,
                };
            }));
        });
    }
    //change password
    changePassword(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.agency;
            const { old_password, new_password } = req.body;
            const model = this.Model.agencyModel();
            const user_details = yield model.getSingleUser({ id });
            if (!user_details.length) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.ResMsg.HTTP_NOT_FOUND,
                };
            }
            const verify_password = yield lib_1.default.compare(old_password, user_details[0].hashed_password);
            if (!verify_password) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_BAD_REQUEST,
                    message: this.ResMsg.PASSWORD_DOES_NOT_MATCH,
                };
            }
            const hashed_password = yield lib_1.default.hashPass(new_password);
            const password_changed = yield model.updateAgencyUser({ hashed_password: hashed_password }, id);
            if (password_changed) {
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.PASSWORD_CHANGED,
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
    getKeyAreaManager(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { agency_id } = req.agency;
                const agencyModel = this.Model.agencyModel(trx);
                const getAgency = yield agencyModel.getSingleAgency(agency_id);
                if (!getAgency[0].kam) {
                    return {
                        success: true,
                        code: this.StatusCode.HTTP_OK,
                        data: [],
                    };
                }
                const adminModel = this.Model.adminModel(trx);
                const getKAM = yield adminModel.getSingleAdmin({ id: getAgency[0].kam });
                if (!getKAM.length) {
                    return {
                        success: true,
                        code: this.StatusCode.HTTP_OK,
                        data: [],
                    };
                }
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    data: {
                        name: getKAM[0].first_name + " " + getKAM[0].last_name,
                        email: getKAM[0].email,
                        phone_number: getKAM[0].phone_number,
                    },
                };
            }));
        });
    }
}
exports.default = BookingProfileService;
