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
exports.TourPackageBookingModel = void 0;
const schema_1 = __importDefault(require("../../utils/miscellaneous/schema"));
class TourPackageBookingModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    //b2c
    //insert tour package book
    insertTourPackageBook(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('tour_package_booking')
                .withSchema(this.BTOC_SCHEMA)
                .insert(payload, 'id');
        });
    }
    //delete tour package delete booking
    deleteTourPackageBook(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('tour_package_booking')
                .withSchema(this.BTOC_SCHEMA)
                .where({ id })
                .del();
        });
    }
    //insert booking contact
    insertTourPackageBookContact(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('tour_package_booking_contact')
                .withSchema(this.BTOC_SCHEMA)
                .insert(payload, 'id');
        });
    }
    //get my booking history
    getMyBookingHistory(user_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('tour_package_booking_view')
                .withSchema(this.BTOC_SCHEMA)
                .where('user_id', user_id)
                .select('*')
                .orderBy('id', 'desc');
        });
    }
    //get all booking requests
    getAllTourPackageBooking(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.db('tour_package_booking_view')
                .withSchema(this.BTOC_SCHEMA)
                .select('id as booking_id', 'tour_id', 'travel_date', 'first_name as contact_name', 'email as contact_email', 'tour_type', 'status', 'title', 'adult_price', 'child_price', 'traveler_adult', 'traveler_child', 'discount', 'discount_type', 'booking_ref')
                .where((qb) => {
                if (params.status) {
                    qb.andWhere('status', params.status);
                }
                if (params.user_id) {
                    qb.andWhere('user_id', params.user_id);
                }
                if (params.title) {
                    qb.andWhere('title', 'ilike', `%${params.title}%`);
                }
                if (params.user_name) {
                    qb.andWhere('first_name', 'ilike', `%${params.user_name}%`);
                }
                if (params.from_travel_date && params.to_travel_date) {
                    const fromDate = new Date(params.from_travel_date).toISOString();
                    // Create a Date object for to_date and add 1 day
                    const toDate = new Date(params.to_travel_date);
                    toDate.setDate(toDate.getDate() + 1); // Add one day
                    // Set the new date to the beginning of the day (00:00:00.000)
                    toDate.setUTCHours(0, 0, 0, 0);
                    qb.andWhereBetween('travel_date', [fromDate, toDate.toISOString()]);
                }
            })
                .orderBy('id', 'desc')
                .limit(params.limit ? params.limit : 100)
                .offset(params.skip ? params.skip : 0);
            const total = yield this.db('tour_package_booking_view')
                .withSchema(this.BTOC_SCHEMA)
                .count('id as total')
                .where((qb) => {
                if (params.status) {
                    qb.andWhere('status', params.status);
                }
                if (params.user_id) {
                    qb.andWhere('user_id', params.user_id);
                }
                if (params.title) {
                    qb.andWhere('title', 'ilike', `%${params.title}%`);
                }
                if (params.user_name) {
                    qb.andWhere('name', 'ilike', `%${params.user_name}%`);
                }
                if (params.from_travel_date && params.to_travel_date) {
                    const fromDate = new Date(params.from_travel_date).toISOString();
                    // Create a Date object for to_date and add 1 day
                    const toDate = new Date(params.to_travel_date);
                    toDate.setDate(toDate.getDate() + 1); // Add one day
                    // Set the new date to the beginning of the day (00:00:00.000)
                    toDate.setUTCHours(0, 0, 0, 0);
                    qb.andWhereBetween('travel_date', [fromDate, toDate.toISOString()]);
                }
            });
            // .orderBy(
            //   'tp.adult_price',
            // )
            return {
                data: data,
                total: total[0].total,
            };
        });
    }
    //get single user booking info
    getSingelUserTourPackageBooking(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.db('tour_package_booking_view')
                .withSchema(this.BTOC_SCHEMA)
                .select('id ', 'tour_id', 'travel_date', 'tour_type', 'status', 'title', 'booking_ref')
                .where((qb) => {
                if (params.status) {
                    qb.andWhere('status', params.status);
                }
                if (params.user_id) {
                    qb.andWhere('user_id', params.user_id);
                }
                if (params.title) {
                    qb.andWhere('title', 'ilike', `%${params.title}%`);
                }
                if (params.user_name) {
                    qb.andWhere('first_name', 'ilike', `%${params.user_name}%`);
                }
                if (params.from_travel_date && params.to_travel_date) {
                    const fromDate = new Date(params.from_travel_date).toISOString();
                    // Create a Date object for to_date and add 1 day
                    const toDate = new Date(params.to_travel_date);
                    toDate.setDate(toDate.getDate() + 1); // Add one day
                    // Set the new date to the beginning of the day (00:00:00.000)
                    toDate.setUTCHours(0, 0, 0, 0);
                    qb.andWhereBetween('travel_date', [fromDate, toDate.toISOString()]);
                }
            });
            const res = yield Promise.all(data.map((item) => __awaiter(this, void 0, void 0, function* () {
                const invoiceData = yield this.db('invoice')
                    .withSchema(this.BTOC_SCHEMA)
                    .select('id', 'total_amount', 'due', 'invoice_number')
                    .where((qb) => {
                    qb.andWhere('ref_id', item.id);
                });
                return Object.assign(Object.assign({}, item), { invoices: invoiceData[0] });
            })));
            const total = yield this.db('tour_package_booking_view')
                .withSchema(this.BTOC_SCHEMA)
                .count('id as total')
                .where((qb) => {
                if (params.status) {
                    qb.andWhere('status', params.status);
                }
                if (params.user_id) {
                    qb.andWhere('user_id', params.user_id);
                }
                if (params.title) {
                    qb.andWhere('title', 'ilike', `%${params.title}%`);
                }
                if (params.user_name) {
                    qb.andWhere('name', 'ilike', `%${params.user_name}%`);
                }
                if (params.from_travel_date && params.to_travel_date) {
                    const fromDate = new Date(params.from_travel_date).toISOString();
                    // Create a Date object for to_date and add 1 day
                    const toDate = new Date(params.to_travel_date);
                    toDate.setDate(toDate.getDate() + 1); // Add one day
                    // Set the new date to the beginning of the day (00:00:00.000)
                    toDate.setUTCHours(0, 0, 0, 0);
                    qb.andWhereBetween('travel_date', [fromDate, toDate.toISOString()]);
                }
            });
            return {
                data: res,
                total: total[0].total,
            };
        });
    }
    //get single booking info
    getSingleBookingInfo(booking_id, user_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.db('tour_package_booking_view')
                .withSchema(this.BTOC_SCHEMA)
                .where({ id: booking_id })
                .select('*')
                // .andWhere((qb)=>{
                //   if(user_id){
                //     qb.andWhere("user_id",user_id)
                //   }
                // })
                .first();
            return data;
        });
    }
    //update single booking
    updateSingleBooking(id, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('tour_package_booking')
                .withSchema(this.BTOC_SCHEMA)
                .where({ id })
                .update(payload);
        });
    }
    //update single booking contact info
    updateSingleBookingContact(id, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('tour_package_booking_contact')
                .withSchema(this.BTOC_SCHEMA)
                .where({ booking_id: id })
                .update(payload);
        });
    }
    //b2b
    //insert tour package book
    insertTourPackageBookB2B(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('tour_package_booking')
                .withSchema(this.AGENT_SCHEMA)
                .insert(payload, 'id');
        });
    }
    //insert booking contact
    insertTourPackageBookContactB2B(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('tour_package_booking_contact')
                .withSchema(this.AGENT_SCHEMA)
                .insert(payload, 'id');
        });
    }
    //get my booking history
    getMyBookingHistoryB2B(user_id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('tour_package_booking_view')
                .withSchema(this.AGENT_SCHEMA)
                .where('user_id', user_id)
                .select('*');
        });
    }
    //get all booking requests
    getAllTourPackageBookingB2B(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.db('tour_package_booking_view')
                .withSchema(this.AGENT_SCHEMA)
                .select('id as booking_id', 'tour_id', 'travel_date', 'first_name as contact_name', 'email as contact_email', 'tour_type', 'status', 'title', 'adult_price', 'child_price', 'traveler_adult', 'traveler_child', 'discount', 'discount_type')
                .where((qb) => {
                if (params.status) {
                    qb.andWhere('status', params.status);
                }
                if (params.user_id) {
                    qb.andWhere('user_id', params.user_id);
                }
                if (params.agency_id) {
                    qb.andWhere('agency_id', params.agency_id);
                }
                if (params.title) {
                    qb.andWhere('title', 'ilike', `%${params.title}%`);
                }
                if (params.user_name) {
                    qb.andWhere('first_name', 'ilike', `%${params.user_name}%`);
                }
                if (params.from_travel_date && params.to_travel_date) {
                    const fromDate = new Date(params.from_travel_date).toISOString();
                    // Create a Date object for to_date and add 1 day
                    const toDate = new Date(params.to_travel_date);
                    toDate.setDate(toDate.getDate() + 1); // Add one day
                    // Set the new date to the beginning of the day (00:00:00.000)
                    toDate.setUTCHours(0, 0, 0, 0);
                    qb.andWhereBetween('travel_date', [fromDate, toDate.toISOString()]);
                }
            })
                // .orderBy(
                //   'tp.adult_price',
                // )
                .limit(params.limit ? params.limit : 100)
                .offset(params.skip ? params.skip : 0).orderBy('id', 'desc');
            const total = yield this.db('tour_package_booking_view')
                .withSchema(this.AGENT_SCHEMA)
                .count('id as total')
                .where((qb) => {
                if (params.status) {
                    qb.andWhere('status', params.status);
                }
                if (params.user_id) {
                    qb.andWhere('user_id', params.user_id);
                }
                if (params.title) {
                    qb.andWhere('title', 'ilike', `%${params.title}%`);
                }
                if (params.agency_id) {
                    qb.andWhere('agency_id', params.agency_id);
                }
                if (params.user_name) {
                    qb.andWhere('name', 'ilike', `%${params.user_name}%`);
                }
                if (params.from_travel_date && params.to_travel_date) {
                    const fromDate = new Date(params.from_travel_date).toISOString();
                    // Create a Date object for to_date and add 1 day
                    const toDate = new Date(params.to_travel_date);
                    toDate.setDate(toDate.getDate() + 1); // Add one day
                    // Set the new date to the beginning of the day (00:00:00.000)
                    toDate.setUTCHours(0, 0, 0, 0);
                    qb.andWhereBetween('travel_date', [fromDate, toDate.toISOString()]);
                }
            })
                // .orderBy(
                //   'tp.adult_price',
                // )
                .limit(params.limit ? params.limit : 100)
                .offset(params.skip ? params.skip : 0);
            return {
                data: data,
                total: total[0].total,
            };
        });
    }
    //get single booking info
    getSingleBookingInfoB2B(booking_id, agency_id) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.db('tour_package_booking_view as tp')
                .withSchema(this.AGENT_SCHEMA)
                .where({ 'tp.id': booking_id })
                .join('agency_info as ai', 'ai.id', 'tp.agency_id')
                .join('btob_user as bu', 'bu.id', 'tp.created_by')
                .select('ai.agency_name', 'tp.*', 'bu.name as created_by')
                .where((qb) => {
                if (agency_id) {
                    qb.andWhere('tp.agency_id', agency_id);
                }
            })
                .first();
            return data;
        });
    }
    //update single booking
    updateSingleBookingB2B(id, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('tour_package_booking')
                .withSchema(this.AGENT_SCHEMA)
                .update(payload)
                .where({ id })
                .returning('id');
        });
    }
    //update single booking contact info
    updateSingleBookingContactB2B(id, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('tour_package_booking_contact')
                .withSchema(this.AGENT_SCHEMA)
                .where({ booking_id: id })
                .update(payload);
        });
    }
}
exports.TourPackageBookingModel = TourPackageBookingModel;
