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
exports.AdminBtoBRegistrationRequestService = void 0;
const abstract_service_1 = __importDefault(require("../../../abstract/abstract.service"));
const lib_1 = __importDefault(require("../../../utils/lib/lib"));
const sendEmailCredential_1 = require("../../../utils/templates/sendEmailCredential");
const constants_1 = require("../../../utils/miscellaneous/constants");
const customError_1 = __importDefault(require("../../../utils/lib/customError"));
class AdminBtoBRegistrationRequestService extends abstract_service_1.default {
    constructor() {
        super();
    }
    // get all registration request
    getAllRegistrationRequest(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = req.query;
            const model = this.Model.b2bRegistrationRequestModel();
            const { total, data } = yield model.getAllRegistrationRequests(query);
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data,
                total,
            };
        });
    }
    // get single registration request
    getSingleRegistrationRequest(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const model = this.Model.b2bRegistrationRequestModel();
            const data = yield model.getSingleRegistrationRequest({
                id: +id,
            });
            if (!data) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.StatusCode.HTTP_NOT_FOUND,
                };
            }
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data,
            };
        });
    }
    // update single registration request
    updateSingleRegistrationRequest(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                var _a, _b, _c, _d, _e;
                const { id } = req.params;
                const body = req.body;
                const { id: admin_id } = req.admin;
                const model = this.Model.b2bRegistrationRequestModel();
                const agencyModel = this.Model.agencyModel(trx);
                const administrationModel = this.Model.btobAdministrationModel(trx);
                const data = yield model.getSingleRegistrationRequest({
                    id: +id,
                });
                if (!data) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.StatusCode.HTTP_NOT_FOUND,
                    };
                }
                if (data.state !== constants_1.REGISTRATION_REQUEST_STATE.PENDING) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_UNPROCESSABLE_ENTITY,
                        message: "The request has already been updated once; it is not possible to update it again",
                    };
                }
                if (body.state === constants_1.REGISTRATION_REQUEST_STATE.APPROVED) {
                    body.approved_by = admin_id;
                    const userEmailExists = yield agencyModel.getSingleUser({
                        email: data.email,
                    });
                    if (userEmailExists.length) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_CONFLICT,
                            message: "User email already exists.",
                        };
                    }
                    const kam_info = yield this.Model.adminModel(trx).getSingleAdmin({ email: req.body.kam_email });
                    if (!kam_info.length) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_NOT_FOUND,
                            message: "No admin has been found with this email address"
                        };
                    }
                    //unique id of agency
                    let agency_ref_number = `${constants_1.PROJECT_CODE}AR-`;
                    const getLastAgency = yield agencyModel.checkAgency({
                        limit: 1,
                    });
                    if (!getLastAgency.data.length) {
                        agency_ref_number += "1000";
                    }
                    else {
                        const lastRef = ((_b = (_a = getLastAgency.data) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.agency_ref_number)
                            ? (_e = (_d = (_c = getLastAgency.data) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.agency_ref_number) === null || _e === void 0 ? void 0 : _e.split("-")[1]
                            : "0";
                        const nextNumber = (parseInt(lastRef, 10) + 1)
                            .toString()
                            .padStart(4, "0");
                        agency_ref_number += nextNumber;
                    }
                    const agencyBody = {
                        agency_name: data.agency_name,
                        email: data.agency_email,
                        phone: data.agency_phone,
                        address: data.address,
                        created_by: admin_id,
                        commission_set_id: body.commission_set_id,
                        agency_logo: data.agency_logo,
                        trade_license: data.trade_license,
                        visiting_card: data.visiting_card,
                        kam: kam_info[0].id,
                        agency_ref_number,
                    };
                    const user_password = lib_1.default.generateRandomPassword(12);
                    const hashed_password = yield lib_1.default.hashPass(user_password);
                    const userBody = {
                        name: data.name,
                        email: data.email,
                        photo: data.photo,
                        hashed_password,
                        mobile_number: data.mobile_number,
                        is_main_user: 1,
                    };
                    const agency = yield agencyModel.createAgency(agencyBody);
                    const { data: permissions } = yield administrationModel.permissionsList({});
                    const role = yield administrationModel.createRole({
                        name: "Super Admin",
                        agency_id: agency[0].id,
                        is_main_role: 1,
                    });
                    userBody["agency_id"] = agency[0].id;
                    userBody["role_id"] = role[0].id;
                    const role_permissions = permissions.map((permission) => ({
                        permission_id: permission.permission_id,
                        read: 1,
                        write: 1,
                        delete: 1,
                        update: 1,
                        agency_id: agency[0].id,
                        role_id: role[0].id,
                    }));
                    if (role_permissions.length) {
                        yield administrationModel.createRolePermission(role_permissions);
                    }
                    const new_agency_user = yield agencyModel.createAgencyUser(userBody);
                    if (!new_agency_user.length) {
                        throw new customError_1.default("Failed to create agency user.", this.StatusCode.HTTP_INTERNAL_SERVER_ERROR);
                    }
                    const mailSubject = "Credentials For B2B Login.";
                    yield lib_1.default.sendEmail(data.email, mailSubject, (0, sendEmailCredential_1.AgencyRegistrationRequestApprovedTemplate)(data.email, user_password));
                    yield lib_1.default.sendEmail([constants_1.PROJECT_EMAIL_OTHERS_1], mailSubject, (0, sendEmailCredential_1.AgencyRegistrationRequestApprovedTemplate)(data.email, user_password));
                }
                else if (body.state === constants_1.REGISTRATION_REQUEST_STATE.REJECTED) {
                    const mailSubject = "Your B2B Registration Request Has Been Declined.";
                    body.rejected_by = admin_id;
                    yield lib_1.default.sendEmail(data.email, mailSubject, (0, sendEmailCredential_1.AgencyRegistrationRequestRejectedTemplate)());
                    yield lib_1.default.sendEmail([constants_1.PROJECT_EMAIL_OTHERS_1], mailSubject, (0, sendEmailCredential_1.AgencyRegistrationRequestRejectedTemplate)());
                }
                const updateRegistrationRequest = {
                    approved_by: body.approved_by,
                    rejected_by: body.rejected_by,
                    rejected_reason: body.rejected_reason,
                    state: body.state,
                    status: body.status,
                };
                const res = yield model.updateRegistrationRequest({ id: +id }, updateRegistrationRequest);
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_OK,
                    data: {
                        id: res[0].id,
                    },
                };
            }));
        });
    }
}
exports.AdminBtoBRegistrationRequestService = AdminBtoBRegistrationRequestService;
