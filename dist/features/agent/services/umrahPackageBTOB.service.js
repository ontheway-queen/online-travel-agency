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
class UmrahPackageBTOBService extends abstract_service_1.default {
    // get Tour Package List
    umrahPackageList(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = this.Model.umrahPackageModel();
            const { to_date, duration, min_price, max_price } = req.query;
            const { umrahPackageCount, umrahPackageWithImage } = yield model.getAllUmrahPackageForB2B({
                to_date,
                duration,
                min_price,
                max_price,
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                total: umrahPackageCount[0].count,
                data: umrahPackageWithImage,
            };
        });
    }
    //get single tour package
    getSingleUmrahPackage(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = Number(req.params.id);
            const model = this.Model.umrahPackageModel();
            const data = yield model.getSingleUmrahPackageForB2B(id);
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data: data
            };
        });
    }
}
exports.default = UmrahPackageBTOBService;
