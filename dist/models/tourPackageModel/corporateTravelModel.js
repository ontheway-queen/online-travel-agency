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
exports.CorporateTravelModel = void 0;
const schema_1 = __importDefault(require("../../utils/miscellaneous/schema"));
class CorporateTravelModel extends schema_1.default {
    constructor(db) {
        super();
        this.db = db;
    }
    //insert Banner Image
    insertBannerImage(image_url) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('corporate_travel_banner')
                .withSchema('services')
                .insert({ image: image_url });
        });
    }
    //insert Tour info
    insertTourinfo(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('tour_package_list')
                .withSchema('services')
                .insert({ tour_id: payload.tour_id, tour_type: payload.tour_type });
        });
    }
    //insert video url
    insertVideo(obj) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('corporate_travel_video')
                .withSchema('services')
                .insert({ video_url: obj.video_url });
        });
    }
    // get all data for corporate travel page
    getDataForCorporatePackagePage() {
        return __awaiter(this, void 0, void 0, function* () {
            const tourPackages = yield this.db('tour_package_list')
                .withSchema('services')
                .select('tour_package_list.id', 'tour_package.title', 'city.name as city_name', 'tour_package.duration', 'tour_package_list.tour_type', 'tour_package.b2c_adult_price', this.db.raw(`
          json_agg(
            json_build_object(
              'id', tour_package_photos.id,
              'file', tour_package_photos.photo
            )
          ) as file
        `))
                .joinRaw('JOIN services.tour_package ON tour_package_list.tour_id=tour_package.id')
                .joinRaw('LEFT JOIN services.tour_package_photos ON tour_package_list.tour_id = tour_package_photos.tour_id')
                .joinRaw('JOIN public.city ON tour_package.city_id = city.id')
                .groupBy('tour_package_list.id', 'tour_package.id', 'city.name')
                .where('tour_package_list.status', true)
                .orderBy('id', 'desc');
            const banner_imgs = yield this.db('corporate_travel_banner')
                .withSchema('services')
                .select('id', 'image as file')
                .where('status', true)
                .orderBy('id', 'desc');
            const videos = yield this.db('corporate_travel_video')
                .withSchema('services')
                .select('id', 'video_url as url')
                .where('status', true)
                .orderBy('id', 'desc');
            return { tourPackages, banner_imgs, videos };
        });
    }
    // update Package list
    updatePackageList(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('tour_package_list')
                .withSchema('services')
                .update({ status: payload.status })
                .where('id', payload.id);
        });
    }
    // update banner Image list
    updateBannerImageList(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('corporate_travel_banner')
                .withSchema('services')
                .update({ status: payload.status })
                .where('id', payload.id);
        });
    }
    // update video list
    updateVideoList(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db('corporate_travel_video')
                .withSchema('services')
                .update({ status: payload.status })
                .where('id', payload.id);
        });
    }
}
exports.CorporateTravelModel = CorporateTravelModel;
