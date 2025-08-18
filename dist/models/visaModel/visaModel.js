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
exports.VisaModel = void 0;
const schema_1 = __importDefault(require("../../utils/miscellaneous/schema"));
class VisaModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    //create visa
    create(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('visa')
                .withSchema(this.SERVICE_SCHEMA)
                .insert(payload, 'id');
        });
    }
    deleteApplication(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('visa')
                .withSchema(this.SERVICE_SCHEMA)
                .del()
                .where({ id });
        });
    }
    //get all visa country
    getAllVisaCountryList(query) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const data = yield this.db('public.country as con')
                .select('con.id', 'con.name', 'con.iso')
                .join('services.visa as vi', 'con.id', 'vi.country_id')
                .groupBy('con.id');
            const total = yield this.db('public.country as con')
                .countDistinct('con.id as total')
                .join('services.visa as vi', 'con.id', 'vi.country_id');
            return {
                data,
                total: (_a = total[0]) === null || _a === void 0 ? void 0 : _a.total,
            };
        });
    }
    //get visa
    get(query_1) {
        return __awaiter(this, arguments, void 0, function* (query, is_total = false) {
            var _a;
            const data = yield this.db('services.visa as vi')
                .select('vi.id', 'vi.country_id', 'con.name as country_name', 'vi.visa_fee', 'vi.processing_fee', 'vi.type', 'vi.max_validity', 'vi.description', 'vi.stay_validity', 'vi.processing_type', 'vi.status', 'vi.image as file')
                .join('public.country as con', 'vi.country_id', 'con.id')
                .where((qb) => {
                if (query.country_id) {
                    qb.andWhere('vi.country_id', query.country_id);
                }
                if (query.status !== undefined) {
                    qb.andWhere('vi.status', query.status);
                }
                if (query.visa_type) {
                    qb.andWhereILike('vi.type', `%${query.visa_type}%`);
                }
            })
                .orderBy('vi.id', 'desc')
                .limit(query.limit || 100)
                .offset(query.skip || 0);
            let total = [];
            if (is_total) {
                total = yield this.db('services.visa as vi')
                    .count('vi.id as total')
                    .join('public.country as con', 'vi.country_id', 'con.id')
                    .where((qb) => {
                    if (query.country_id) {
                        qb.andWhere('vi.country_id', query.country_id);
                    }
                    if (query.status !== undefined) {
                        qb.andWhere('vi.status', query.status);
                    }
                });
            }
            return {
                data,
                total: (_a = total[0]) === null || _a === void 0 ? void 0 : _a.total,
            };
        });
    }
    //get single visa
    single(id, status) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db('services.visa as vi')
                .select('vi.id', 'vi.country_id', 'con.name as country_name', 'con.iso', 'visa_fee', 'processing_fee', 'max_validity', 'type', 'description', 'stay_validity', 'visa_mode', 'processing_type', 'documents_details', 'status', 'image as file', 'required_fields')
                .join('public.country as con', 'con.id', 'vi.country_id')
                .where('vi.id', id)
                .andWhere((qb) => {
                if (status !== undefined) {
                    qb.andWhere('vi.status', status);
                }
            });
        });
    }
    //update
    update(payload, id) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db('visa')
                .withSchema(this.SERVICE_SCHEMA)
                .update(payload)
                .where({ id });
        });
    }
    //----B2C application----//
    //create app
    b2cCreateApplication(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db('visa_application')
                .withSchema(this.BTOC_SCHEMA)
                .insert(payload, '*');
        });
    }
    //update b2c visa application
    b2cUpdateApplication(status, id) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db('visa_application')
                .withSchema(this.BTOC_SCHEMA)
                .update({ status })
                .where({ id });
        });
    }
    //create traveler
    b2cCreateTraveler(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db('visa_application_traveller')
                .withSchema(this.BTOC_SCHEMA)
                .insert(payload, 'id');
        });
    }
    //create tracking
    b2cCreateTracking(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db('visa_application_tracking')
                .withSchema(this.BTOC_SCHEMA)
                .insert(payload, 'id');
        });
    }
    //get app
    getB2CApplication(query_1) {
        return __awaiter(this, arguments, void 0, function* (query, is_total = false) {
            var _a;
            const data = yield this.db('visa_application as va')
                .withSchema(this.BTOC_SCHEMA)
                .select('va.id', 'va.user_id', 'us.username', 'us.first_name', 'us.last_name', 'va.visa_id', 'visa.max_validity', 'visa.type', 'visa.description', 'va.from_date', 'va.to_date', 'va.traveler', 'va.visa_fee', 'va.processing_fee', 'va.payable', 'va.application_date', 'va.contact_email', 'va.contact_number', 'va.booking_ref', 'con.name as country_name')
                .join('users as us', 'us.id', 'va.user_id')
                .joinRaw('join services.visa on visa.id = va.visa_id')
                .joinRaw('join public.country as con on con.id = visa.country_id')
                .where((qb) => {
                if (query.user_id) {
                    qb.andWhere('va.user_id', query.user_id);
                }
                if (query.filter) {
                    qb.andWhere((qbc) => {
                        qbc.whereILike('us.username', `%${query.filter}%`);
                        qbc.orWhereILike('va.contact_email', `%${query.filter}%`);
                        qbc.orWhereILike('va.contact_number', `%${query.filter}%`);
                        qbc.orWhereRaw("LOWER(us.first_name || ' ' || us.last_name) LIKE LOWER(?)", [
                            `%${query.filter ? query.filter.toLocaleLowerCase() : undefined}%`,
                        ]);
                    });
                }
                if (query.from_date && query.to_date) {
                    qb.andWhereBetween('va.application_date', [
                        query.from_date,
                        query.to_date,
                    ]);
                }
            })
                .orderBy('va.id', 'desc')
                .limit(query.limit || 100)
                .offset(query.skip || 0);
            let total = [];
            if (is_total) {
                total = yield this.db('visa_application as va')
                    .withSchema(this.BTOC_SCHEMA)
                    .count('va.id as total')
                    .join('users as us', 'us.id', 'va.user_id')
                    .where((qb) => {
                    if (query.user_id) {
                        qb.andWhere('va.user_id', query.user_id);
                    }
                    if (query.filter) {
                        qb.andWhere((qbc) => {
                            qbc.whereILike('us.username', `%${query.filter}%`);
                            qbc.orWhereILike('va.contact_email', `%${query.filter}%`);
                            qbc.orWhereILike('va.contact_number', `%${query.filter}%`);
                            qbc.orWhereRaw("LOWER(us.first_name || ' ' || us.last_name) LIKE LOWER(?)", [
                                `%${query.filter ? query.filter.toLocaleLowerCase() : undefined}%`,
                            ]);
                        });
                    }
                    if (query.from_date && query.to_date) {
                        qb.andWhereBetween('va.application_date', [
                            query.from_date,
                            query.to_date,
                        ]);
                    }
                });
            }
            return { data, total: (_a = total[0]) === null || _a === void 0 ? void 0 : _a.total };
        });
    }
    getSingleUserVisaApplication(query) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const data = yield this.db('visa_application as va')
                .withSchema(this.BTOC_SCHEMA)
                .select('va.id', 'va.visa_id', 'visa.max_validity', 'visa.type', 'va.traveler', 'va.visa_fee', 'va.processing_fee', 'va.payable', 'va.application_date', 'va.status', 'va.booking_ref')
                .leftJoin('users as us', 'us.id', 'va.user_id')
                .joinRaw('left join services.visa on visa.id = va.visa_id')
                .where((qb) => {
                if (query.user_id) {
                    qb.andWhere('va.user_id', query.user_id);
                }
            })
                .orderBy('va.id', 'desc');
            const res = yield Promise.all(data.map((item) => __awaiter(this, void 0, void 0, function* () {
                const invoiceData = yield this.db('invoice')
                    .withSchema(this.BTOC_SCHEMA)
                    .select('id', 'total_amount', 'due', 'invoice_number')
                    .where((qb) => {
                    qb.andWhere('ref_id', item.id);
                });
                return Object.assign(Object.assign({}, item), { invoices: invoiceData[0] });
            })));
            let total = [];
            total = yield this.db('visa_application as va')
                .withSchema(this.BTOC_SCHEMA)
                .count('va.id as total')
                .join('users as us', 'us.id', 'va.user_id')
                .where((qb) => {
                if (query.user_id) {
                    qb.andWhere('va.user_id', query.user_id);
                }
            });
            return { res, total: (_a = total[0]) === null || _a === void 0 ? void 0 : _a.total };
        });
    }
    //single application
    b2cSingleApplication(id, user_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const visaApplicationData = yield this.db('visa_application as va')
                .withSchema(this.BTOC_SCHEMA)
                .select('va.id', 'va.user_id', 'us.username', 'us.first_name', 'us.last_name', 'us.email', 'va.visa_id', 'visa.max_validity', 'visa.type', 'visa.description', 'va.from_date', 'va.to_date', 'va.traveler', 'va.visa_fee', 'va.processing_fee', 'va.payable', 'va.application_date', 'va.contact_email', 'va.contact_number', 'va.whatsapp_number', 'visa.country_id', 'va.booking_ref', 'con.name as country_name')
                .join('users as us', 'us.id', 'va.user_id')
                .joinRaw('join services.visa on visa.id = va.visa_id')
                .joinRaw('join public.country as con on con.id = visa.country_id')
                .where('va.id', id)
                .andWhere((qb) => {
                if (user_id) {
                    qb.andWhere('va.user_id', user_id);
                }
            })
                .first();
            if (!visaApplicationData)
                return null;
            const countryData = yield this.db('country as con')
                .withSchema(this.PUBLIC_SCHEMA)
                .select('name', 'iso')
                .where('id', visaApplicationData.country_id)
                .first();
            return Object.assign(Object.assign({}, visaApplicationData), { country_name: countryData ? countryData.name : null, country_iso: countryData ? countryData.iso : null });
        });
    }
    //traveler list
    b2cTravelerList(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('visa_application_traveller as vat')
                .withSchema(this.BTOC_SCHEMA)
                .select('vat.id', 'title', 'first_name', 'last_name', 'type', 'date_of_birth', 'passport_number', 'passport_expiry_date', 'city', 'con.name as country_name', 'address', 'passport_type', 'vat.type', 'vat.required_fields')
                .joinRaw('left Join public.country as con on con.id = vat.country_id')
                .where('vat.application_id', id)
                .orderBy('vat.id', 'asc');
        });
    }
    //tracking list
    b2cTrackingList(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('visa_application_tracking')
                .withSchema(this.BTOC_SCHEMA)
                .select('id', 'status', 'details', 'created_date')
                .where('application_id', id)
                .orderBy('id', 'asc');
        });
    }
    //----B2C application----//
    //----B2B application----//
    //create app
    b2bCreateApplication(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db('visa_application')
                .withSchema(this.AGENT_SCHEMA)
                .insert(payload, 'id');
        });
    }
    //create traveler
    b2bCreateTraveler(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db('visa_application_traveller')
                .withSchema(this.AGENT_SCHEMA)
                .insert(payload, 'id');
        });
    }
    //create tracking
    b2bCreateTracking(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db('visa_application_tracking')
                .withSchema(this.AGENT_SCHEMA)
                .insert(payload, 'id');
        });
    }
    //get app
    getB2BApplication(query_1) {
        return __awaiter(this, arguments, void 0, function* (query, is_total = false) {
            var _a;
            const data = yield this.db('agent.visa_application as va')
                .select('va.id', 'va.agent_id', 'va.agency_id', 'ai.agency_name', 'ai.agency_logo', 'bu.name as agent_name', 'va.visa_id', 'visa.max_validity', 'visa.type', 'visa.description', 'va.from_date', 'va.to_date', 'va.traveler', 'va.visa_fee', 'va.processing_fee', 'va.payable', 'va.application_date', 'va.contact_email', 'va.contact_number', 'va.booking_ref', 'con.name as country_name')
                .join('agent.agency_info as ai', 'ai.id', 'va.agency_id')
                .join('agent.btob_user as bu', 'bu.id', 'va.agent_id')
                .join('services.visa', 'visa.id', 'va.visa_id')
                .join('public.country as con', 'con.id', 'visa.country_id')
                .where((qb) => {
                if (query.agent_id) {
                    qb.andWhere('va.agent_id', query.agent_id);
                }
                if (query.filter) {
                    qb.andWhere((qbc) => {
                        qbc.whereILike('ai.agency_name', `%${query.filter}%`);
                        qbc.orWhereILike('va.contact_email', `%${query.filter}%`);
                        qbc.orWhereILike('va.contact_number', `%${query.filter}%`);
                        qbc.orWhereILike('bu.name', `%${query.filter}%`);
                    });
                }
                if (query.from_date && query.to_date) {
                    qb.andWhereBetween('va.application_date', [
                        query.from_date,
                        query.to_date,
                    ]);
                }
            })
                .orderBy('va.id', 'desc')
                .limit(query.limit || 100)
                .offset(query.skip || 0);
            let total = [];
            if (is_total) {
                total = yield this.db('agent.visa_application as va')
                    .count('va.id as total')
                    .join('agent.agency_info as ai', 'ai.id', 'va.agency_id')
                    .join('agent.btob_user as bu', 'bu.id', 'va.agent_id')
                    .where((qb) => {
                    if (query.agent_id) {
                        qb.andWhere('va.agent_id', query.agent_id);
                    }
                    if (query.filter) {
                        qb.andWhere((qbc) => {
                            qbc.whereILike('ai.agency_name', `%${query.filter}%`);
                            qbc.orWhereILike('va.contact_email', `%${query.filter}%`);
                            qbc.orWhereILike('va.contact_number', `%${query.filter}%`);
                            qbc.orWhereILike('bu.name', `%${query.filter}%`);
                        });
                    }
                    if (query.from_date && query.to_date) {
                        qb.andWhereBetween('va.application_date', [
                            query.from_date,
                            query.to_date,
                        ]);
                    }
                });
            }
            return { data, total: (_a = total[0]) === null || _a === void 0 ? void 0 : _a.total };
        });
    }
    //single application
    b2bSingleApplication(id, agent_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('agent.visa_application as va')
                .select('va.id', 'va.agent_id', 'va.agency_id', 'ai.agency_name', 'ai.agency_logo', 'bu.name as agent_name', 'va.visa_id', 'visa.max_validity', 'visa.type', 'visa.description', 'va.from_date', 'va.to_date', 'va.traveler', 'va.visa_fee', 'va.processing_fee', 'va.payable', 'va.application_date', 'va.contact_email', 'va.contact_number', 'va.whatsapp_number', 'va.booking_ref', 'con.name as country_name')
                .join('agent.agency_info as ai', 'ai.id', 'va.agency_id')
                .join('agent.btob_user as bu', 'bu.id', 'va.agent_id')
                .join('services.visa', 'visa.id', 'va.visa_id')
                .join('public.country as con', 'con.id', 'visa.country_id')
                .where('va.id', id)
                .andWhere((qb) => {
                if (agent_id) {
                    qb.andWhere('va.agent_id', agent_id);
                }
            });
        });
    }
    //traveler list
    b2bTravelerList(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('agent.visa_application_traveller as vat')
                .select('vat.id', 'title', 'first_name', 'last_name', 'type', 'date_of_birth', 'passport_number', 'passport_expiry_date', 'city', 'con.name as country_name', 'address', 'passport_type', 'vat.type', "vat.required_fields")
                .leftJoin('public.country as con', 'con.id', 'vat.country_id')
                .where('vat.application_id', id)
                .orderBy('vat.id', 'asc');
        });
    }
    //tracking list
    b2bTrackingList(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('visa_application_tracking')
                .withSchema(this.AGENT_SCHEMA)
                .select('id', 'status', 'details', 'created_date')
                .where('application_id', id)
                .orderBy('id', 'asc');
        });
    }
    //----B2B application----//
    // create visa type
    insertVisaType(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('visa_type')
                .insert(payload)
                .withSchema(this.SERVICE_SCHEMA);
        });
    }
    // get all visa type
    getAllVisaType() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('visa_type')
                .withSchema(this.SERVICE_SCHEMA)
                .select('id', 'name');
        });
    }
    // delete  visa type
    deleteVisaType(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('visa_type')
                .withSchema(this.SERVICE_SCHEMA)
                .del()
                .where({ id });
        });
    }
    // create visa mode
    insertVisaMode(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('visa_mode')
                .insert(payload)
                .withSchema(this.SERVICE_SCHEMA);
        });
    }
    // get all visa mode
    getAllVisaMode() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('visa_mode')
                .withSchema(this.SERVICE_SCHEMA)
                .select('id', 'name');
        });
    }
    // delete  visa mode
    deleteVisaMode(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('visa_mode')
                .withSchema(this.SERVICE_SCHEMA)
                .del()
                .where({ id });
        });
    }
}
exports.VisaModel = VisaModel;
