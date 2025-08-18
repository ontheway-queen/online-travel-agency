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
const abstract_service_1 = __importDefault(require("../../../abstract/abstract.service"));
const constants_1 = require("../../../utils/miscellaneous/constants");
class TourPackageBTOCService extends abstract_service_1.default {
    // get Tour Package List
    tourPackageList(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = this.Model.tourPackageModel();
            const query = req.query;
            const data = yield model.getTourPackageListV2(Object.assign(Object.assign({}, query), { s_type: 'b2c' }));
            // console.log(data)
            // console.log(query);
            // Fetch reviews for each tour package
            // const tourPackagesWithReviews = await Promise.all(
            //   data.data.map(async (tourPackage) => {
            //     const review = await model.getReview(tourPackage.id);
            //     return {
            //       ...tourPackage,
            //       review_count: review.count || 0,
            //       average_rating: review.average || 0,
            //     };
            //   })
            // );
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                total: data.total,
                data: data.data,
            };
        });
    }
    //get single tour package
    getSingleTourPackage(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = Number(req.params.id);
            const data = yield this.Model.tourPackageModel().getSingleTourPackage(id);
            const photos = yield this.Model.tourPackageModel().getTourPhotos(id);
            const include_services = yield this.Model.tourPackageModel().getTourServices(id, constants_1.TOUR_PACKAGE_INCLUDE_SERVICE);
            const exclude_services = yield this.Model.tourPackageModel().getTourServices(id, constants_1.TOUR_PACKAGE_EXCLUDE_SERVICE);
            const highlight_services = yield this.Model.tourPackageModel().getTourServices(id, constants_1.TOUR_PACKAGE_HIGHLIGHT_SERVICE);
            // const reviews = await this.Model.tourPackageModel().getAllTourPackesReview({
            //   tour_id: id,
            // });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data: Object.assign(Object.assign({}, data[0]), { photos,
                    include_services,
                    exclude_services,
                    highlight_services }),
            };
        });
    }
    //get city name
    getCityName(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = this.Model.tourPackageModel();
            const city = yield model.getCityName();
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data: city,
            };
        });
    }
    //get country name
    getCountryName(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = this.Model.tourPackageModel();
            const country = yield model.getCountryName();
            // console.log('country',country)
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data: country,
            };
        });
    }
}
exports.default = TourPackageBTOCService;
