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
exports.AdminDynamicFareRulesService = void 0;
const abstract_service_1 = __importDefault(require("../../../abstract/abstract.service"));
const customError_1 = __importDefault(require("../../../utils/lib/customError"));
class AdminDynamicFareRulesService extends abstract_service_1.default {
    // ------------------ Dynamic Fare Set ------------------
    createSet(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                const { name } = req.body;
                const { id: created_by } = req.admin;
                const model = this.Model.DynamicFareModel(trx);
                const check_duplicate = yield model.getSets(name);
                if (check_duplicate.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_CONFLICT,
                        message: 'Set already exists with this name',
                    };
                }
                const res = yield model.createSet({ name, created_by });
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: 'Dynamic fare set has been created',
                    data: { id: (_a = res[0]) === null || _a === void 0 ? void 0 : _a.id },
                };
            }));
        });
    }
    getSets(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = this.Model.DynamicFareModel();
            const data = yield model.getSets();
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                data,
            };
        });
    }
    updateSet(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = this.Model.DynamicFareModel();
            const { id } = req.params;
            const body = req.body;
            const existing = yield model.getSetById(Number(id));
            if (!existing.length) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.ResMsg.HTTP_NOT_FOUND,
                };
            }
            const check_duplicate = yield model.getSets(body.name);
            if (check_duplicate.length) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_CONFLICT,
                    message: 'Set already exists with this name',
                };
            }
            yield model.updateSet(Number(id), body);
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: 'Dynamic fare set updated',
            };
        });
    }
    deleteSet(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                const model = this.Model.DynamicFareModel(trx);
                const { id } = req.params;
                const existing = yield model.getSetById(Number(id));
                if (!existing.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND,
                    };
                }
                const agencyModel = this.Model.agencyModel(trx);
                const check_agency_set_usage = yield agencyModel.checkAgency({
                    commission_set_id: Number(id),
                });
                if (check_agency_set_usage.data.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_CONFLICT,
                        message: 'This set is already used for agencies. To continue update sets of the agencies.',
                    };
                }
                const check_b2c_set_usage = yield model.getB2CCommission();
                if (Number((_a = check_b2c_set_usage === null || check_b2c_set_usage === void 0 ? void 0 : check_b2c_set_usage[0]) === null || _a === void 0 ? void 0 : _a.commission_set_id) === Number(id)) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_CONFLICT,
                        message: 'This set is already used for B2C. To continue update set for B2C.',
                    };
                }
                yield model.deleteSet(Number(id));
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: 'Dynamic fare set deleted',
                };
            }));
        });
    }
    cloneSet(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                var _a, _b, _c, _d, _e;
                const model = this.Model.DynamicFareModel(trx);
                const { id } = req.params;
                const existing = yield model.getSetById(Number(id));
                if (!existing.length) {
                    throw new customError_1.default(this.ResMsg.HTTP_NOT_FOUND, this.StatusCode.HTTP_NOT_FOUND);
                }
                const { name } = req.body;
                const { id: created_by } = req.admin;
                const check_duplicate = yield model.getSets(name);
                if (check_duplicate.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_CONFLICT,
                        message: 'Set already exists with this name',
                    };
                }
                const res = yield model.createSet({ name, created_by });
                //get supplier list
                const suppliers = yield model.getSuppliers({ set_id: Number(id), order_by: 'asc' });
                if (suppliers.length) {
                    //clone suppliers
                    for (const supplier of suppliers) {
                        const new_supplier = yield model.createSupplier({
                            set_id: (_a = res[0]) === null || _a === void 0 ? void 0 : _a.id,
                            supplier_id: supplier.supplier_id,
                            commission: supplier.commission,
                            commission_type: supplier.commission_type,
                            markup: supplier.markup,
                            markup_type: supplier.markup_type,
                            status: supplier.status,
                            segment_commission: supplier.segment_commission,
                            segment_commission_type: supplier.segment_commission_type,
                            segment_markup: supplier.segment_markup,
                            segment_markup_type: supplier.segment_markup_type,
                            pax_markup: supplier.pax_markup,
                        });
                        //clone supplier airlines fare
                        const supplierAirlinesFares = yield model.getSupplierAirlinesFares({
                            dynamic_fare_supplier_id: supplier.id,
                            order_by: 'asc',
                        });
                        if (supplierAirlinesFares.length) {
                            for (const fare of supplierAirlinesFares) {
                                yield model.createSupplierAirlinesFare({
                                    dynamic_fare_supplier_id: (_b = new_supplier[0]) === null || _b === void 0 ? void 0 : _b.id,
                                    airline: fare.airline,
                                    from_dac: fare.from_dac,
                                    to_dac: fare.to_dac,
                                    soto: fare.soto,
                                    domestic: fare.domestic,
                                    commission_type: fare.commission_type,
                                    commission: fare.commission,
                                    markup_type: fare.markup_type,
                                    markup: fare.markup,
                                    flight_class: fare.flight_class,
                                    segment_commission: fare.segment_commission,
                                    pax_markup: fare.pax_markup,
                                    segment_commission_type: fare.segment_commission_type,
                                    segment_markup: fare.segment_markup,
                                    segment_markup_type: fare.segment_markup_type,
                                    status: fare.status,
                                });
                            }
                        }
                        //clone preferred/blocked airlines
                        const airlinePreferenceModel = this.Model.AirlinesPreferenceModel(trx);
                        const preferredAirlines = yield airlinePreferenceModel.getAirlinesPreferences({
                            dynamic_fare_supplier_id: supplier.id,
                            order_by: 'asc',
                        });
                        if (preferredAirlines.length) {
                            for (const airline of preferredAirlines) {
                                yield airlinePreferenceModel.createAirlinePreference({
                                    dynamic_fare_supplier_id: (_c = new_supplier[0]) === null || _c === void 0 ? void 0 : _c.id,
                                    airlines_code: airline.airlines_code,
                                    status: airline.status,
                                    preference_type: airline.preference_type,
                                    from_dac: airline.from_dac,
                                    to_dac: airline.to_dac,
                                    domestic: airline.domestic,
                                    soto: airline.soto,
                                });
                            }
                        }
                        //clone fare taxes
                        const fareTaxes = yield model.getFareTaxes({
                            dynamic_fare_supplier_id: suppliers[0].id,
                            order_by: 'asc'
                        });
                        if (fareTaxes.length) {
                            for (const fareTax of fareTaxes) {
                                yield model.createFareTax({
                                    dynamic_fare_supplier_id: (_d = res[0]) === null || _d === void 0 ? void 0 : _d.id,
                                    airline: fareTax.airline,
                                    tax_name: fareTax.tax_name,
                                    commission: fareTax.commission,
                                    commission_type: fareTax.commission_type,
                                    markup: fareTax.markup,
                                    markup_type: fareTax.markup_type,
                                    status: fareTax.status,
                                });
                            }
                        }
                    }
                }
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: 'Dynamic fare has been cloned',
                    data: { id: (_e = res[0]) === null || _e === void 0 ? void 0 : _e.id },
                };
            }));
        });
    }
    // ------------------ Supplier List------------------
    getSupplierList(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = this.Model.DynamicFareModel();
            const data = yield model.getSupplierList();
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                data,
            };
        });
    }
    // ------------------ Dynamic Fare Supplier ------------------
    createSupplier(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                const model = this.Model.DynamicFareModel(trx);
                const check_entry = yield model.getSuppliers({
                    set_id: req.body.set_id,
                    supplier_id: req.body.supplier_id,
                });
                if (check_entry.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_CONFLICT,
                        message: 'This supplier already exists for this set',
                    };
                }
                const res = yield model.createSupplier(req.body);
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: 'Supplier created',
                    data: { id: (_a = res[0]) === null || _a === void 0 ? void 0 : _a.id },
                };
            }));
        });
    }
    getSuppliers(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { set_id } = req.query;
            const model = this.Model.DynamicFareModel();
            const data = yield model.getSuppliers({ set_id: Number(set_id) });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                data,
            };
        });
    }
    updateSupplier(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = this.Model.DynamicFareModel();
            const { id } = req.params;
            const existing = yield model.getSupplierById(Number(id));
            if (!existing.length) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.ResMsg.HTTP_NOT_FOUND,
                };
            }
            yield model.updateSupplier(Number(id), req.body);
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: 'Supplier updated',
            };
        });
    }
    deleteSupplier(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = this.Model.DynamicFareModel();
            const { id } = req.params;
            const existing = yield model.getSupplierById(Number(id));
            if (!existing.length) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.ResMsg.HTTP_NOT_FOUND,
                };
            }
            yield model.deleteSupplier(Number(id));
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: 'Supplier deleted',
            };
        });
    }
    // ------------------ Supplier Airlines Dynamic Fare ------------------
    createSupplierAirlinesFare(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const model = this.Model.DynamicFareModel(trx);
                const { body } = req.body;
                const payload = [];
                for (const elm of body) {
                    const airlineCodes = elm.airline
                        .split(',')
                        .map((code) => code.trim().toUpperCase());
                    for (const code of airlineCodes) {
                        payload.push(Object.assign(Object.assign({}, elm), { airline: code }));
                    }
                }
                yield model.createSupplierAirlinesFare(payload);
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: 'Supplier airline fare created',
                };
            }));
        });
    }
    getSupplierAirlinesFares(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { dynamic_fare_supplier_id } = req.query;
            const model = this.Model.DynamicFareModel();
            const data = yield model.getSupplierAirlinesFares({
                dynamic_fare_supplier_id: Number(dynamic_fare_supplier_id),
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                data,
            };
        });
    }
    updateSupplierAirlinesFare(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = this.Model.DynamicFareModel();
            const { id } = req.params;
            const existing = yield model.getSupplierAirlinesFareById(Number(id));
            if (!existing.length) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.ResMsg.HTTP_NOT_FOUND,
                };
            }
            yield model.updateSupplierAirlinesFare(Number(id), req.body);
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: 'Supplier airline fare updated',
            };
        });
    }
    deleteSupplierAirlinesFare(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = this.Model.DynamicFareModel();
            const { id } = req.params;
            const existing = yield model.getSupplierAirlinesFareById(Number(id));
            if (!existing.length) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.ResMsg.HTTP_NOT_FOUND,
                };
            }
            yield model.deleteSupplierAirlinesFare(Number(id));
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: 'Supplier airline fare deleted',
            };
        });
    }
    // ------------------ Dynamic Fare Tax ------------------
    createFareTax(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const model = this.Model.DynamicFareModel(trx);
                const { body } = req.body;
                for (const elm of body) {
                    const airlineCodes = elm.airline
                        .split(',')
                        .map((code) => code.trim().toUpperCase());
                    for (const code of airlineCodes) {
                        yield model.createFareTax(Object.assign(Object.assign({}, elm), { airline: code }));
                    }
                }
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: 'Fare tax created',
                };
            }));
        });
    }
    getFareTaxes(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { dynamic_fare_supplier_id } = req.query;
            const model = this.Model.DynamicFareModel();
            const data = yield model.getFareTaxes({
                dynamic_fare_supplier_id: Number(dynamic_fare_supplier_id),
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                data,
            };
        });
    }
    updateFareTax(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = this.Model.DynamicFareModel();
            const { id } = req.params;
            const existing = yield model.getFareTaxById(Number(id));
            if (!existing.length) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.ResMsg.HTTP_NOT_FOUND,
                };
            }
            yield model.updateFareTax(Number(id), req.body);
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: 'Fare tax updated',
            };
        });
    }
    deleteFareTax(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = this.Model.DynamicFareModel();
            const { id } = req.params;
            const existing = yield model.getFareTaxById(Number(id));
            if (!existing.length) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.ResMsg.HTTP_NOT_FOUND,
                };
            }
            yield model.deleteFareTax(Number(id));
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: 'Fare tax deleted',
            };
        });
    }
    //upsert btoc commission
    upsertBtoCCommission(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = this.Model.DynamicFareModel();
            const { commission_set_id } = req.body;
            yield model.upsertB2CCommission({ commission_set_id });
            return {
                success: true,
                code: this.StatusCode.HTTP_SUCCESSFUL,
                message: this.ResMsg.HTTP_SUCCESSFUL,
            };
        });
    }
    //get btoc commission
    getBtoCCommission(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = this.Model.DynamicFareModel();
            const data = yield model.getB2CCommission();
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                data: data,
            };
        });
    }
}
exports.AdminDynamicFareRulesService = AdminDynamicFareRulesService;
exports.default = AdminDynamicFareRulesService;
