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
exports.UmrahPackageModel = void 0;
const schema_1 = __importDefault(require("../../utils/miscellaneous/schema"));
class UmrahPackageModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    // Create Umrah Package
    createUmrahPackage(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('umrah_package')
                .withSchema('services')
                .insert(payload)
                .returning('id');
        });
    }
    //insert package include exclude
    insertPackageIncludeExclude(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('umrah_package_include')
                .withSchema('services')
                .insert(payload);
        });
    }
    // Create Umrah Package Details
    createUmrahPackageDetails(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            // console.log('payload', payload);
            return yield this.db('umrah_package_details')
                .withSchema('services')
                .insert(payload)
                .returning('id');
        });
    }
    // Get All the umrah package from admin
    getAllUmrahPackage(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const umrahPackage = yield this.db('umrah_package')
                .withSchema('services')
                .select('id', 'package_name', 'duration', 'is_featured', 'valid_till_date', 'group_size', 'total_accommodation', 'total_destination', 'b2b_price_per_person', 'b2b_discount', 'b2c_price_per_person', 'b2c_discount', 'status', 'b2b_discount_type', 'b2c_discount_type')
                .where((qb) => {
                if (params.to_date) {
                    qb.andWhere('valid_till_date', '<=', params.to_date);
                }
            })
                .andWhere((qb) => {
                if (params.status !== undefined) {
                    qb.where('status', '=', params.status);
                }
            })
                .andWhere((qb) => {
                if (params.is_deleted !== undefined) {
                    qb.where('is_deleted', '=', params.is_deleted);
                }
            })
                .andWhere((qb) => {
                if (params.title) {
                    qb.whereILike('package_name', `%${params.title}%`);
                }
            })
                .limit(params.limit)
                .offset(params.offset)
                .orderBy('id', 'desc');
            const umrahPackageCount = yield this.db('umrah_package')
                .withSchema('services')
                .select(this.db.raw('COUNT(id) as total'))
                .where((qb) => {
                if (params.to_date) {
                    qb.andWhere('valid_till_date', '<=', params.to_date);
                }
            })
                .andWhere((qb) => {
                if (params.status !== undefined) {
                    qb.where('status', '=', params.status);
                }
            })
                .andWhere((qb) => {
                if (params.is_deleted !== undefined) {
                    qb.where('is_deleted', '=', params.is_deleted);
                }
            })
                .andWhere((qb) => {
                if (params.title) {
                    qb.whereILike('package_name', `%${params.title}%`);
                }
            });
            // Access the total count
            // console.log(umrahPackageCount[0].total);
            // console.log(umrahPackageCount);
            return { umrahPackage, umrahPackageCount };
        });
    }
    getIncludeExcludeItems() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('umrah_include_exclude_items')
                .withSchema('services')
                .select('*');
        });
    }
    // Upload Umrah Package Image
    uplaodUmrahPackageImage(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('umrah_package_photos')
                .withSchema('services')
                .insert(payload);
        });
    }
    // Get Single Umrah Package for admin
    getSingleUmrahPackage(id, slug) {
        return __awaiter(this, void 0, void 0, function* () {
            const singlePackage = yield this.db('umrah_package as up')
                .withSchema('services')
                .select('up.*', this.db.raw(`(
        SELECT json_agg(
          json_build_object(
            'id', upp.id,
            'photo', upp.photo
          )
        ) 
        FROM services.umrah_package_photos as upp
        WHERE upp.umrah_id = up.id
      ) as images`), this.db.raw(`(
        SELECT json_agg(detail)
        FROM (
          SELECT json_build_object(
            'id', upd.id,
            'umrah_id', upd.umrah_id,
            'details_title', upd.details_title,
            'details_description', upd.details_description,
            'type', upd.type,
            'status', upd.status
          ) AS detail
          FROM services.umrah_package_details as upd
          WHERE upd.umrah_id = up.id 
          ORDER BY upd.id
        ) AS ordered_details
      ) as package_details`), this.db.raw(`(
        SELECT json_agg(
          json_build_object(
            'index' , upei.id,
            'id', uiei.id
          )
        )
        FROM services.umrah_package_include as upei
        JOIN services.umrah_include_exclude_items as uiei 
          ON upei.include_exclude_id = uiei.id
        WHERE upei.umrah_id = up.id
      ) AS include`))
                .where((qb) => {
                if (id) {
                    qb.andWhere('up.id', id);
                }
                if (slug) {
                    qb.andWhere('up.slug', slug);
                }
            })
                .first();
            return singlePackage;
        });
    }
    getSlugCheck(id, slug) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('umrah_package')
                .withSchema('services')
                .whereNot('id', id)
                .andWhere('slug', slug);
        });
    }
    // Update Umrah Package
    updateUmrahPackage(payload, id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('umrah_package')
                .withSchema('services')
                .where({ id: id })
                .update(payload);
        });
    }
    //update umrah package details
    updateUmrahPackageDetails(payload, id) {
        return __awaiter(this, void 0, void 0, function* () {
            // console.log({ payload });
            return yield this.db('umrah_package_details')
                .withSchema('services')
                .update(payload)
                .where('id', id);
        });
    }
    //delete package include exclude
    deleteIncludeExclude(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('umrah_package_include')
                .withSchema('services')
                .where('id', id)
                .del();
        });
    }
    //Delete Umrah Package Image
    deleteUmrahPackageImage(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('umrah_package_photos')
                .withSchema('services')
                .where('id', id)
                .del();
        });
    }
    //delete umrah package details
    deleteUmrahPackageDetails(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('umrah_package_details')
                .withSchema('services')
                .where('id', id)
                .del();
        });
    }
    //Get All Umrah Package For B2C
    getAllUmrahPackageForB2C(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const allUmrahPackage = yield this.db('umrah_package')
                .withSchema('services')
                .select('id', 'package_name', 'duration', 'valid_till_date', 'group_size', 'b2c_price_per_person', 'b2c_discount', 'b2c_discount_type', 'slug')
                .where((qb) => {
                if (params.to_date) {
                    qb.whereRaw(`DATE(valid_till_date) <= DATE(?)`, [params.to_date]);
                }
            })
                .andWhere((qb) => {
                if (params.duration) {
                    qb.where('duration', '<=', params.duration);
                }
            })
                .andWhere('status', true)
                .andWhere((qb) => {
                if (params.min_price && params.max_price) {
                    qb.andWhereBetween('b2c_adult_price', [
                        params.min_price,
                        params.max_price,
                    ]);
                }
            }).orderBy("id", 'desc');
            const umrahPackageCount = yield this.db('umrah_package')
                .withSchema('services')
                .count('id')
                .where((qb) => {
                if (params.to_date) {
                    qb.whereRaw(`DATE(valid_till_date) <= DATE(?)`, [params.to_date]);
                }
            })
                .andWhere((qb) => {
                if (params.duration) {
                    qb.where('duration', '<=', params.duration);
                }
            })
                .andWhere('status', true)
                .andWhere((qb) => {
                if (params.min_price && params.max_price) {
                    qb.andWhereBetween('b2c_adult_price', [
                        params.min_price,
                        params.max_price,
                    ]);
                }
            });
            const umrahPackageWithImage = yield Promise.all(allUmrahPackage.map((umrahPackage) => __awaiter(this, void 0, void 0, function* () {
                const images = yield this.db('umrah_package_photos')
                    .withSchema('services')
                    .select('id', 'photo')
                    .where({ umrah_id: umrahPackage.id });
                return Object.assign(Object.assign({}, umrahPackage), { images });
            })));
            return { umrahPackageWithImage, umrahPackageCount };
        });
    }
    getAllUmrahPackageForB2B(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const allUmrahPackage = yield this.db('umrah_package')
                .withSchema('services')
                .select('id', 'package_name', 'duration', 'valid_till_date', 'group_size', 'b2c_price_per_person', 'b2c_discount', 'b2c_discount_type', 'slug')
                .where((qb) => {
                if (params.to_date) {
                    qb.whereRaw(`DATE(valid_till_date) <= DATE(?)`, [params.to_date]);
                }
            })
                .andWhere((qb) => {
                if (params.duration) {
                    qb.where('duration', '<=', params.duration);
                }
            })
                .andWhere('status', true)
                .andWhere((qb) => {
                if (params.min_price && params.max_price) {
                    qb.andWhereBetween('b2c_adult_price', [
                        params.min_price,
                        params.max_price,
                    ]);
                }
            }).orderBy("id", 'desc');
            const umrahPackageCount = yield this.db('umrah_package')
                .withSchema('services')
                .count('id')
                .where((qb) => {
                if (params.to_date) {
                    qb.whereRaw(`DATE(valid_till_date) <= DATE(?)`, [params.to_date]);
                }
            })
                .andWhere((qb) => {
                if (params.duration) {
                    qb.where('duration', '<=', params.duration);
                }
            })
                .andWhere('status', true)
                .andWhere((qb) => {
                if (params.min_price && params.max_price) {
                    qb.andWhereBetween('b2c_adult_price', [
                        params.min_price,
                        params.max_price,
                    ]);
                }
            });
            const umrahPackageWithImage = yield Promise.all(allUmrahPackage.map((umrahPackage) => __awaiter(this, void 0, void 0, function* () {
                const images = yield this.db('umrah_package_photos')
                    .withSchema('services')
                    .select('id', 'photo')
                    .where({ umrah_id: umrahPackage.id });
                return Object.assign(Object.assign({}, umrahPackage), { images });
            })));
            return { umrahPackageWithImage, umrahPackageCount };
        });
    }
    //Get Single Umrah Package
    getSingleUmrahPackageForB2C(slug) {
        return __awaiter(this, void 0, void 0, function* () {
            const singlePackage = yield this.db('umrah_package as up')
                .withSchema('services')
                .select('up.id', 'up.package_name', 'up.slug', 'up.description', 'up.duration', 'up.valid_till_date', 'up.group_size', 'up.b2c_price_per_person', 'up.b2c_discount', 'up.b2c_discount_type', 'up.journey_start_date', 'up.journey_end_date', 'up.itinerary', 'up.total_accommodation', 'up.total_destination', 'up.meeting_point', this.db.raw(`(
        SELECT json_agg(
          json_build_object(
            'id', upp.id,
            'photo', upp.photo
          )
        ) 
        FROM services.umrah_package_photos as upp
        WHERE upp.umrah_id = up.id
      ) as images`), this.db.raw(`(
        SELECT json_agg(
          json_build_object(
            'id', upd.id,
            'title', upd.details_title,
            'description', upd.details_description
          )
        )
        FROM services.umrah_package_details as upd
        WHERE upd.umrah_id = up.id AND upd.status = true AND upd.type = 'price'
      ) as price_details`), this.db.raw(`(
        SELECT json_agg(
          json_build_object(
            'id', upd.id,
            'title', upd.details_title,
            'description', upd.details_description
          )
        )
        FROM services.umrah_package_details as upd
        WHERE upd.umrah_id = up.id AND upd.status = true AND upd.type = 'accommodation'
      ) as accommodation_details`), this.db.raw(`(
        SELECT json_agg(
          json_build_object(
            'id' , upei.id,
            'icon', uiei.icon,
            'title', uiei.title,
            'description', uiei.description
          )
        )
        FROM services.umrah_package_include as upei
        JOIN services.umrah_include_exclude_items as uiei 
          ON upei.include_exclude_id = uiei.id
        WHERE upei.umrah_id = up.id 
      ) AS include`))
                .where('up.slug', slug)
                .andWhere('up.status', true)
                .first();
            return singlePackage;
        });
    }
    getSingleUmrahPackageForB2B(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const singlePackage = yield this.db('umrah_package as up')
                .withSchema('services')
                .select('up.id', 'up.package_name', 'up.slug', 'up.description', 'up.duration', 'up.valid_till_date', 'up.group_size', 'up.b2c_price_per_person', 'up.b2c_discount', 'up.b2c_discount_type', 'up.journey_start_date', 'up.journey_end_date', 'up.itinerary', 'up.total_accommodation', 'up.total_destination', 'up.meeting_point', this.db.raw(`(
        SELECT json_agg(
          json_build_object(
            'id', upp.id,
            'photo', upp.photo
          )
        ) 
        FROM services.umrah_package_photos as upp
        WHERE upp.umrah_id = up.id
      ) as images`), this.db.raw(`(
        SELECT json_agg(
          json_build_object(
            'id', upd.id,
            'title', upd.details_title,
            'description', upd.details_description
          )
        )
        FROM services.umrah_package_details as upd
        WHERE upd.umrah_id = up.id AND upd.status = true AND upd.type = 'price'
      ) as price_details`), this.db.raw(`(
        SELECT json_agg(
          json_build_object(
            'id', upd.id,
            'title', upd.details_title,
            'description', upd.details_description
          )
        )
        FROM services.umrah_package_details as upd
        WHERE upd.umrah_id = up.id AND upd.status = true AND upd.type = 'accommodation'
      ) as accommodation_details`), this.db.raw(`(
        SELECT json_agg(
          json_build_object(
            'id' , upei.id,
            'icon', uiei.icon,
            'title', uiei.title,
            'description', uiei.description
          )
        )
        FROM services.umrah_package_include as upei
        JOIN services.umrah_include_exclude_items as uiei 
          ON upei.include_exclude_id = uiei.id
        WHERE upei.umrah_id = up.id 
      ) AS include`))
                .where('up.id', id)
                .andWhere('up.status', true)
                .first();
            return singlePackage;
        });
    }
    //Get City Name
    getCityName() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('umrah_package')
                .withSchema('services')
                .joinRaw('JOIN public.city ON services.umrah_package.city_id = public.city.id')
                .select('umrah_package.city_id', 'city.name', 'code')
                .distinct();
        });
    }
    // create umrah package details description
    createDetailDescription(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('umrah_package_detail_description')
                .withSchema('services')
                .insert(payload)
                .onConflict('page')
                .merge();
        });
    }
    // get umrah package details description
    getDetailDescription() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('umrah_package_detail_description')
                .withSchema('services')
                .select('title', 'description', 'meta_title', 'meta_description', 'cover_img', 'status', 'page');
        });
    }
}
exports.UmrahPackageModel = UmrahPackageModel;
