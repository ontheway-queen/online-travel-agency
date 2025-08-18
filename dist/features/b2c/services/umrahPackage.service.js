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
exports.B2CUmrahPackageService = void 0;
const abstract_service_1 = __importDefault(require("../../../abstract/abstract.service"));
class B2CUmrahPackageService extends abstract_service_1.default {
    constructor() {
        super();
    }
    //get all umrah package for b2c
    getAllUmrahPackageForB2C(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = this.Model.umrahPackageModel();
            const { to_date, duration, min_price, max_price } = req.query;
            const { umrahPackageWithImage, umrahPackageCount } = yield model.getAllUmrahPackageForB2C({
                to_date,
                duration,
                min_price,
                max_price,
            });
            if (!umrahPackageWithImage) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.ResMsg.HTTP_NOT_FOUND,
                };
            }
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                total: umrahPackageCount[0].count,
                data: umrahPackageWithImage,
            };
        });
    }
    // Get Single Umrah Package For B2C
    getSingleUmrahPackageForB2C(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = this.Model.umrahPackageModel();
            const { slug } = req.params;
            // console.log(slug)
            const singlePackage = yield model.getSingleUmrahPackageForB2C(slug);
            if (!singlePackage) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.ResMsg.HTTP_NOT_FOUND,
                };
            }
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data: singlePackage,
            };
        });
    }
    // Get City Name
    getCityName(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = this.Model.umrahPackageModel();
            const city = yield model.getCityName();
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data: city,
            };
        });
    }
}
exports.B2CUmrahPackageService = B2CUmrahPackageService;
