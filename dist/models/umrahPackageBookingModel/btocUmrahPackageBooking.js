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
exports.BtocUmrahPackageBookingModel = void 0;
const schema_1 = __importDefault(require("../../utils/miscellaneous/schema"));
class BtocUmrahPackageBookingModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    // insert Package Booking data
    umrahPackageInsert(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('umrah_package_booking')
                .withSchema('booking')
                .insert(payload)
                .returning('id');
        });
    }
    //insert umrah package booking for b2b
    insertUmrahPackageBookingB2B(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('umrah_package_booking')
                .withSchema(this.AGENT_SCHEMA)
                .insert(payload)
                .returning('id');
        });
    }
    //insert umrah package booking contact for b2b
    insertUmrahPackageBookingContactB2B(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('umrah_package_booking_contact')
                .withSchema(this.AGENT_SCHEMA)
                .insert(payload);
        });
    }
    insertUmrahPackageBookingContact(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('umrah_package_booking_contact')
                .withSchema('booking')
                .insert(payload);
        });
    }
    //insert umrah package booking contact
    customizePackageInsert(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('umrah_package_booking_contact')
                .withSchema('booking')
                .insert(payload);
        });
    }
    //Get all the fixed package booking request
    // public async getAllPackageBookingRequest(offset: number, limit: number) {
    //   return await this.db<IUmrahPackageBookingPayload>(
    //     'umrah_package_booking as upb'
    //   )
    //     .withSchema('booking')
    //     .select(
    //       'upb.id as booking_id',
    //       'btoc.users.id as user_id',
    //       'btoc.users.first_name',
    //       'btoc.users.last_name',
    //       'btoc.users.email',
    //       'btoc.users.phone_number',
    //       'upb.traveler_adult',
    //       'upb.traveler_child',
    //       'upb.note_from_customer',
    //       'upb.adult_price',
    //       'upb.child_price',
    //       'upb.travel_date',
    //       'upb.double_room',
    //       'upb.twin_room',
    //       'upb.status',
    //       'umrah_package.id as umrah_id',
    //       'umrah_package.package_name',
    //       'umrah_package.duration',
    //       'umrah_package.b2c_price_per_person',
    //       'umrah_package.journey_start_date',
    //       'umrah_package.journey_end_date',
    //       this.db.raw(`COUNT(upb.id)::integer as total`)
    //     )
    //     .joinRaw('JOIN services.umrah_package ON upb.umrah_id=umrah_package.id')
    //     .joinRaw('JOIN btoc.users ON upb.user_id=users.id')
    //     .groupBy('upb.id', 'users.id', 'umrah_package.id')
    //     .limit(limit ? limit : 10)
    //     .offset(offset ? offset : 0);
    // }
    //Get all the customize package booking request
    // public async getAllCustomizePackageBookingRequest() {
    //   return await this.db<ICustomizeUmrahPackageBookingPayload>(
    //     'umrah_package_booking_contact'
    //   )
    //     .withSchema('btoc')
    //     .select('*');
    // }
    // Get User booking History
    getMyBookingHistory(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const history = yield this.db('umrah_package_booking as upb')
                .withSchema(this.BTOC_SCHEMA)
                .where('user_id', params.user_id)
                .select('upb.id as booking_id', 'upb.umrah_id', 'upb.traveler_adult', 'upb.traveler_child', 'upb.price_per_person', 'upb.discount', 'upb.status', 'upb.discount_type', 'upbc.first_name as contact_name', 'upbc.email as contact_email', 'up.package_name')
                .joinRaw('JOIN booking.umrah_package_booking_contact as upbc ON upb.id=upbc.booking_id')
                .joinRaw('LEFT JOIN services.umrah_package as up ON upb.umrah_id=up.id')
                .limit(params.limit ? params.limit : 20)
                .offset(params.skip ? params.skip : 0);
            const historyCount = yield this.db('umrah_package_booking as upb')
                .withSchema(this.BTOC_SCHEMA)
                .where('user_id', params.user_id)
                .count('upb.id')
                .joinRaw('JOIN booking.umrah_package_booking_contact as upbc ON upb.id=upbc.booking_id')
                .joinRaw('LEFT JOIN services.umrah_package as up ON upb.umrah_id=up.id');
            return { history, historyCount };
        });
    }
    // Get BTOB Agency Booking History
    getAgencyBookingHistory(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const history = yield this.db('umrah_package_booking as upb')
                .withSchema(this.AGENT_SCHEMA)
                .where('agency_id', params.agency_id)
                .select('upb.id as booking_id', 'upb.umrah_id', 'upb.traveler_adult', 'upb.traveler_child', 'upb.price_per_person', 'upb.discount', 'upb.status', 'upb.discount_type', 'upbc.first_name as contact_name', 'upbc.email as contact_email', 'up.package_name')
                .joinRaw('JOIN b2b.umrah_package_booking_contact as upbc ON upb.id=upbc.booking_id')
                .joinRaw('LEFT JOIN services.umrah_package as up ON upb.umrah_id=up.id')
                .limit(params.limit ? params.limit : 20)
                .offset(params.skip ? params.skip : 0);
            const historyCount = yield this.db('umrah_package_booking as upb')
                .withSchema(this.AGENT_SCHEMA)
                .where('agency_id', params.agency_id)
                .count('upb.id')
                .joinRaw('JOIN b2b.umrah_package_booking_contact as upbc ON upb.id=upbc.booking_id')
                .joinRaw('LEFT JOIN services.umrah_package as up ON upb.umrah_id=up.id');
            return { history, historyCount };
        });
    }
    //get b2c single booking
    getSingleBooking(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('umrah_package_booking as upb')
                .withSchema(this.BTOC_SCHEMA)
                .select('upb.umrah_id', 'upb.traveler_adult', 'upb.traveler_child', 'upb.price_per_person', 'upb.discount', 'upb.status', 'upb.discount_type', 'upb.booking_ref', 'upbc.*', 'up.package_name', 'up.duration', 'up.valid_till_date', 'up.group_size', 'up.b2b_price_per_person', 'up.b2c_price_per_person', 'up.b2b_discount', 'up.b2c_discount', 'up.b2b_discount_type', 'up.b2c_discount_type', 'up.journey_start_date', 'up.journey_end_date', 'up.total_accommodation', 'up.total_destination', 'up.meeting_point')
                .joinRaw('JOIN booking.umrah_package_booking_contact as upbc ON upb.id=upbc.booking_id')
                .joinRaw('LEFT JOIN services.umrah_package as up ON upb.umrah_id=up.id')
                .where('upb.id', id)
                .first();
        });
    }
    //get b2b single booking
    getSingleBTOBBooking(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('umrah_package_booking as upb')
                .withSchema(this.AGENT_SCHEMA)
                .select('upb.umrah_id', 'upb.traveler_adult', 'upb.traveler_child', 'upb.price_per_person', 'upb.discount', 'upb.status', 'upb.discount_type', 'upbc.*', 'up.package_name', 'up.duration', 'up.valid_till_date', 'up.group_size', 'up.b2b_price_per_person', 'up.b2b_discount', 'up.b2b_discount_type', 'up.journey_start_date', 'up.journey_end_date', 'up.total_accommodation', 'up.total_destination', 'up.meeting_point')
                .joinRaw('JOIN b2b.umrah_package_booking_contact as upbc ON upb.id=upbc.booking_id')
                .joinRaw('LEFT JOIN services.umrah_package as up ON upb.umrah_id=up.id')
                .where('upb.id', id)
                .first();
        });
    }
    // get all umrah booking for admin
    getAllUmrahPackageBooking(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const data = yield this.db('umrah_package_booking_view')
                .withSchema(this.BTOC_SCHEMA)
                .select('id as booking_id', 'umrah_id', 'travel_date', 'first_name as contact_name', 'email as contact_email', 'phone as contact_number', 'status', 'package_name', 'price_per_person', 'traveler_adult', 'traveler_child', 'discount', 'discount_type')
                .where((qb) => {
                if (params.status) {
                    qb.andWhere('status', params.status);
                }
                if (params.user_id) {
                    qb.andWhere('user_id', params.user_id);
                }
                if (params.title) {
                    qb.andWhere('package_name', 'ilike', `%${params.title}%`);
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
                    // console.log(toDate.toISOString()); // Check the adjusted date in UTC
                    qb.andWhereBetween('travel_date', [fromDate, toDate.toISOString()]);
                }
            })
                // .orderBy(
                //   'tp.adult_price',
                // )
                .limit(params.limit ? params.limit : 100)
                .offset(params.skip ? params.skip : 0);
            const total = yield this.db('umrah_package_booking_view')
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
                    qb.andWhere('package_name', 'ilike', `%${params.title}%`);
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
                    // console.log(toDate.toISOString()); // Check the adjusted date in UTC
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
    //b2c single booking update from admin
    updateSingleBooking(id, payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('umrah_package_booking')
                .withSchema(this.BTOC_SCHEMA)
                .where({ id })
                .update({ status: payload.status });
        });
    }
}
exports.BtocUmrahPackageBookingModel = BtocUmrahPackageBookingModel;
