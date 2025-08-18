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
exports.AdminAgentAgencyService = void 0;
const abstract_service_1 = __importDefault(require("../../../../abstract/abstract.service"));
const depositTemplates_1 = require("../../../../utils/templates/depositTemplates");
const lib_1 = __importDefault(require("../../../../utils/lib/lib"));
const sendEmailCredential_1 = require("../../../../utils/templates/sendEmailCredential");
const constants_1 = require("../../../../utils/miscellaneous/constants");
const adminNotificationTemplate_1 = require("../../../../utils/templates/adminNotificationTemplate");
const config_1 = __importDefault(require("../../../../config/config"));
class AdminAgentAgencyService extends abstract_service_1.default {
    constructor() {
        super();
    }
    adjustAgencyBalance(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id: admin_id } = req.admin;
            const body = req.body;
            body.admin_id = admin_id;
            const model = this.Model.agencyModel();
            const checkAgency = yield model.getSingleAgency(req.body.agency_id);
            if (!checkAgency.length) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: "Agency not found",
                };
            }
            const file = req.files || [];
            if (file.length) {
                if (file[0].fieldname === "payment_slip_file") {
                    body[file[0].fieldname] = file[0].filename;
                }
            }
            const res = yield model.insertAgencyLedger(body);
            if (res) {
                // send email
                yield lib_1.default.sendEmail(checkAgency[0].email, `Your account has been ${body.type}ed with BDT ${body.amount}`, (0, depositTemplates_1.template_onDepositToAgency_send_to_agent)({
                    amount: body.amount,
                    remarks: body.details,
                    type: body.type,
                    date_time: new Date().toLocaleString(),
                }));
                //send email to admin
                yield lib_1.default.sendEmail(constants_1.PROJECT_EMAIL_OTHERS_1, `Agency adjust balance`, (0, adminNotificationTemplate_1.email_template_to_send_notification)({
                    title: "adjust balance has been made for agency",
                    details: {
                        details: `Balance has been adjusted. Type: ${body.type}. Amount: ${body.amount}`,
                    },
                }));
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: this.ResMsg.HTTP_SUCCESSFUL,
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
    //get list
    getAllDepositRequestList(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { limit, skip, status } = req.query;
            const data = yield this.Model.agencyModel().getAllAgencyDepositRequest({
                limit: Number(limit),
                skip: Number(skip),
                status: status,
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                total: data.total,
                data: data.data,
            };
        });
    }
    //get list
    updateDepositRequest(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const { status: bdy_status, reason, remarks: body_remarks } = req.body;
            const model = this.Model.agencyModel();
            // get single deposit
            const data = yield model.getSingleDeposit({
                id: parseInt(req.params.id),
            });
            if (!data.length) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.ResMsg.HTTP_NOT_FOUND,
                };
            }
            const { status, amount, remarks, agency_id, bank_name, payment_date, agency_email, agency_logo, agency_name, } = data[0];
            if (status == "pending" && bdy_status == "approved") {
                //add credit to agency ledger
                yield model.insertAgencyLedger({
                    type: "credit",
                    amount,
                    agency_id,
                    created_by: req.admin.id,
                    details: body_remarks
                });
                //update deposit request
                yield model.updateAgencyDepositRequest({
                    status: bdy_status,
                    reason,
                    remarks: body_remarks,
                }, { id: parseInt(id), agency_id });
                //
            }
            else {
                yield model.updateAgencyDepositRequest({
                    status: bdy_status,
                    reason,
                    remarks: body_remarks,
                }, { id: parseInt(id), agency_id });
            }
            yield lib_1.default.sendEmail(agency_email, `Your deposit request of BDT ${amount} has been ${bdy_status === "approved" ? "approved" : "rejected"}`, (0, depositTemplates_1.template_onDepositReqUpdate_send_to_agent)({
                title: "Deposit Request Acknowledgement",
                bank_name: bank_name,
                total_amount: amount,
                agency_name,
                remarks,
                logo: agency_logo,
                payment_date: payment_date,
                status: bdy_status,
            }));
            //send email to admin
            yield lib_1.default.sendEmail(constants_1.PROJECT_EMAIL_OTHERS_1, `Deposit req has been updated`, (0, adminNotificationTemplate_1.email_template_to_send_notification)({
                title: "Deposit req has been updated",
                details: {
                    details: `Deposit request of BDT ${amount} has been ${bdy_status === "approved" ? "approved" : "rejected"}`,
                },
            }));
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: "Updated Successfully",
            };
        });
    }
    //get all transaction list
    getAllTransaction(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = this.Model.agencyModel();
            const { limit, skip, from_date, to_date, agency_id } = req.query;
            const data = yield model.getAllTransaction({
                limit,
                skip,
                from_date,
                to_date,
                agency_id,
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                total: data.total,
                data: data.data,
            };
        });
    }
    //get transaction
    getTransaction(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const model = this.Model.agencyModel();
            const { start_date, end_date, limit, skip } = req.query;
            const data = yield model.getAgencyTransactions({
                agency_id: Number(id),
                start_date: start_date,
                end_date: end_date,
                limit: limit,
                skip: skip,
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                total: data.total,
                data: data.data,
            };
        });
    }
    // Create agency
    create(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                var _a, _b, _c, _d, _e;
                const model = this.Model.btobAdministrationModel(trx);
                const { id: admin_id } = req.admin;
                const { agency_name, agency_email, agency_phone, user_name, user_email, user_password, user_phone, commission_set_id, address, } = req.body;
                const files = req.files || [];
                const agencyModel = this.Model.agencyModel(trx);
                const agencyBody = {
                    agency_name,
                    email: agency_email,
                    phone: agency_phone,
                    created_by: admin_id,
                    commission_set_id,
                    address,
                };
                const checkEmail = yield agencyModel.getSingleUser({ email: user_email });
                if (checkEmail.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_CONFLICT,
                        message: "Email already exist.",
                    };
                }
                if (req.body.kam_email) {
                    const kam_info = yield this.Model.adminModel(trx).getSingleAdmin({
                        email: req.body.kam_email,
                    });
                    if (!kam_info.length) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_NOT_FOUND,
                            message: "No admin has been found with this email address",
                        };
                    }
                    agencyBody.kam = kam_info[0].id;
                }
                const hashed_password = yield lib_1.default.hashPass(user_password);
                const userBody = {
                    name: user_name,
                    email: user_email,
                    hashed_password,
                    mobile_number: user_phone,
                };
                files.forEach((item) => {
                    if (item.fieldname === "agency_logo") {
                        agencyBody["agency_logo"] = item.filename;
                    }
                    else if (item.fieldname === "user_photo") {
                        userBody["photo"] = item.filename;
                    }
                    else if (item.fieldname === "trade_license") {
                        agencyBody["trade_license"] = item.filename;
                    }
                    else if (item.fieldname === "visiting_card") {
                        agencyBody["visiting_card"] = item.filename;
                    }
                });
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
                agencyBody.agency_ref_number = agency_ref_number;
                const agency = yield agencyModel.createAgency(agencyBody);
                userBody["agency_id"] = agency[0].id;
                // let btocToken = '';
                // if (btoc_commission) {
                //   btocToken = uuidv4();
                //   await agencyModel.insertAgencyBtoCToken({
                //     agency_id: agency[0],
                //     token: btocToken,
                //   });
                // }
                const userRes = yield agencyModel.createAgencyUser(userBody);
                // console.log(userRes)
                const role_res = yield model.createRole({
                    name: "super-admin",
                    created_by: userRes[0].id,
                    agency_id: agency[0].id,
                });
                const { data: permissions } = yield model.permissionsList({});
                if (permissions.length) {
                    const permission_body = permissions.map((element) => {
                        return {
                            role_id: parseInt(role_res[0].id),
                            permission_id: parseInt(element.permission_id),
                            read: 1,
                            write: 1,
                            update: 1,
                            delete: 1,
                            created_by: userRes[0].id,
                            agency_id: agency[0].id,
                        };
                    });
                    // console.log(permission_body)
                    yield model.createRolePermission(permission_body);
                }
                // update agency
                yield agencyModel.updateAgencyUser({ role_id: parseInt(role_res[0].id) }, userRes[0].id);
                const mailSubject = "Credentials For B2B Login.";
                if (userRes.length) {
                    yield lib_1.default.sendEmail(user_email, mailSubject, (0, sendEmailCredential_1.newAgencyAccount)(user_email, user_password));
                }
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: this.ResMsg.HTTP_SUCCESSFUL,
                    data: {
                        id: agency[0].id,
                        agency_logo: agencyBody.agency_logo,
                        user_photo: userBody.photo,
                    },
                };
            }));
        });
    }
    // get agency
    get(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = req.query;
            const agencyModel = this.Model.agencyModel();
            const { data, total } = yield agencyModel.getAgency(query);
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data,
                total,
            };
        });
    }
    // get single agency
    getSingle(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const agencyModel = this.Model.agencyModel();
            const data = yield agencyModel.getSingleAgency(Number(id));
            if (!data.length) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.ResMsg.HTTP_NOT_FOUND,
                };
            }
            const query = req.query;
            const users = yield agencyModel.getUser(Object.assign({ agency_id: Number(id) }, query));
            const balance = yield agencyModel.getTotalBalance(Number(id));
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data: Object.assign(Object.assign({}, data[0]), { users,
                    balance }),
            };
        });
    }
    // update single agency
    update(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                var _a, _b;
                const body = req.body;
                const { id } = req.params;
                const files = req.files || [];
                const agencyModel = this.Model.agencyModel(trx);
                const agency = yield agencyModel.checkAgency({ id: Number(id) });
                if (body.email && agency.data[0].email !== body.email) {
                    const checkEmail = yield agencyModel.checkAgency({
                        email: body.email,
                    });
                    if (checkEmail.data.length) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_CONFLICT,
                            message: "the email already exists",
                        };
                    }
                }
                files.forEach((item) => {
                    if (item.fieldname === "agency_logo") {
                        body["agency_logo"] = item.filename;
                    }
                    else if (item.fieldname === "user_photo") {
                        body["photo"] = item.filename;
                    }
                    else if (item.fieldname === "trade_license") {
                        body["trade_license"] = item.filename;
                    }
                    else if (item.fieldname === "visiting_card") {
                        body["visiting_card"] = item.filename;
                    }
                });
                const { kam_email } = body, rest = __rest(body, ["kam_email"]);
                if (kam_email) {
                    const adminModel = this.Model.adminModel(trx);
                    const getAdmin = yield adminModel.getSingleAdmin({ email: kam_email });
                    if (!getAdmin.length) {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_NOT_FOUND,
                            message: "No admin has been found with this email",
                        };
                    }
                    rest.kam = getAdmin[0].id;
                }
                yield agencyModel.updateAgency(rest, Number(id));
                //send email to admin
                yield lib_1.default.sendEmail([
                    constants_1.PROJECT_EMAIL_OTHERS_1,
                ], `Agency has been updated`, (0, adminNotificationTemplate_1.email_template_to_send_notification)({
                    title: "Agency has been updated",
                    details: {
                        details: `Agency ${(_b = (_a = agency.data) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.agency_name} has been updated`,
                    },
                }));
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_OK,
                    data: {
                        agency_logo: body.agency_logo,
                    },
                };
            }));
        });
    }
    // create agency user
    createUser(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { agency_id, name, email, password, mobile_number } = req.body;
            const userModel = this.Model.agencyModel();
            const checkEmail = yield userModel.getSingleUser({ email });
            const files = req.files || [];
            if (checkEmail.length) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_CONFLICT,
                    message: "Email already exist.",
                };
            }
            const hashed_password = yield lib_1.default.hashPass(password);
            const userBody = {
                name,
                email,
                hashed_password,
                mobile_number,
                agency_id,
            };
            if (files.length) {
                userBody["photo"] = files[0].filename;
            }
            const newUser = yield userModel.createAgencyUser(userBody);
            const mailSubject = "Credentials For B2B Login.";
            if (newUser.length) {
                yield lib_1.default.sendEmail(email, mailSubject, (0, sendEmailCredential_1.newAgencyAccount)(email, password));
                yield lib_1.default.sendEmail([
                    constants_1.PROJECT_EMAIL_OTHERS_1,
                ], mailSubject, (0, sendEmailCredential_1.newAgencyAccount)(email, password));
            }
            return {
                success: true,
                code: this.StatusCode.HTTP_SUCCESSFUL,
                message: this.ResMsg.HTTP_SUCCESSFUL,
                data: {
                    id: newUser[0].id,
                    photo: userBody.photo,
                },
            };
        });
    }
    // update agency user
    updateUser(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const userModel = this.Model.agencyModel();
            const checkUser = yield userModel.getSingleUser({ id: Number(id) });
            const files = req.files || [];
            const body = req.body;
            if (!checkUser.length) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.ResMsg.HTTP_NOT_FOUND,
                };
            }
            if (body.email && body.email !== checkUser[0].email) {
                const checkEmail = yield userModel.getSingleUser({ email: body.email });
                if (checkEmail.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_CONFLICT,
                        message: "The email already exists",
                    };
                }
            }
            const userBody = Object.assign({}, body);
            if (files.length) {
                userBody["photo"] = files[0].filename;
            }
            yield userModel.updateAgencyUser(userBody, Number(id));
            if (files.length && checkUser[0].photo) {
                yield this.manageFile.deleteFromCloud([checkUser[0].photo]);
            }
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
            };
        });
    }
    //agent login
    agentPortalLogin(req) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const { id } = req.params;
            const agencyModel = this.Model.agencyModel();
            const getAgency = yield agencyModel.getSingleAgency(Number(id));
            if (!getAgency.length) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: "Agency not found!",
                };
            }
            const checkUser = yield agencyModel.getSingleUser({
                agency_id: Number(id),
                status: true,
            });
            if (!checkUser.length) {
                return {
                    success: false,
                    code: 404,
                    message: "User not found!",
                };
            }
            const _b = checkUser[0], { password: user_password, role_id, agency_id } = _b, rest = __rest(_b, ["password", "role_id", "agency_id"]);
            if (rest.status == false) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_FORBIDDEN,
                    message: "Your account has been disabled",
                };
            }
            if (((_a = getAgency[0]) === null || _a === void 0 ? void 0 : _a.status) == false) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_FORBIDDEN,
                    message: "Your agency account has been disabled",
                };
            }
            const agencyAdmModel = this.Model.btobAdministrationModel();
            let role_permission = [];
            if (role_id) {
                role_permission = yield agencyAdmModel.getSingleRole({
                    id: parseInt(role_id),
                    agency_id,
                });
            }
            const token_data = {
                id: rest.id,
                name: rest.name,
                email: rest.email,
                mobile_number: rest.mobile_number,
                photo: rest.photo,
                user_status: rest.status,
                agency_id: agency_id,
                ref_id: getAgency[0].ref_id,
                agency_logo: getAgency[0].agency_logo,
                agency_name: getAgency[0].agency_name,
                agency_status: getAgency[0].status,
                commission_set_id: getAgency[0].commission_set_id,
            };
            const token = lib_1.default.createToken(token_data, config_1.default.JWT_SECRET_AGENT, "1h");
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.LOGIN_SUCCESSFUL,
                token,
            };
        });
    }
}
exports.AdminAgentAgencyService = AdminAgentAgencyService;
