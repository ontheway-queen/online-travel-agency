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
exports.CorporatePackageService = void 0;
const abstract_service_1 = __importDefault(require("../../../abstract/abstract.service"));
class CorporatePackageService extends abstract_service_1.default {
    constructor() {
        super();
    }
    insertCorporatePackageTravelPageInfo(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = this.Model.corporateTravelModel();
            const { tour_package, video } = req.body;
            const files = req.files || [];
            const tour_package_parse = JSON.parse(tour_package);
            const video_parse = JSON.parse(video);
            if (files.length) {
                Promise.all(files.map((file) => __awaiter(this, void 0, void 0, function* () {
                    yield model.insertBannerImage(file.filename);
                })));
            }
            if (tour_package_parse.length) {
                Promise.all(tour_package_parse.map((tour) => __awaiter(this, void 0, void 0, function* () {
                    yield model.insertTourinfo({
                        tour_id: tour.tour_id,
                        tour_type: tour.tour_type,
                    });
                })));
            }
            if (video_parse.length) {
                Promise.all(video_parse.map((obj) => __awaiter(this, void 0, void 0, function* () {
                    yield model.insertVideo(obj);
                })));
            }
            return {
                success: true,
                code: this.StatusCode.HTTP_SUCCESSFUL,
                message: this.ResMsg.HTTP_SUCCESSFUL,
            };
        });
    }
    getDataForCorporatePackagePage() {
        return __awaiter(this, void 0, void 0, function* () {
            const model = this.Model.corporateTravelModel();
            const tourPackage = yield model.getDataForCorporatePackagePage();
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data: tourPackage,
            };
        });
    }
    updateCorporateTravelPageData(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = this.Model.corporateTravelModel();
            const { packages, videos, banners } = req.body;
            // console.log(packages, videos, banners);
            if (packages.length) {
                Promise.all(packages.map((obj) => __awaiter(this, void 0, void 0, function* () {
                    yield model.updatePackageList(obj);
                })));
            }
            if (videos.length) {
                Promise.all(videos.map((obj) => __awaiter(this, void 0, void 0, function* () {
                    yield model.updateVideoList(obj);
                })));
            }
            if (banners.length) {
                Promise.all(banners.map((obj) => __awaiter(this, void 0, void 0, function* () {
                    yield model.updateBannerImageList(obj);
                })));
            }
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
            };
        });
    }
}
exports.CorporatePackageService = CorporatePackageService;
