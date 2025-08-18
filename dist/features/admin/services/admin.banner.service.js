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
exports.AdminBannerServie = void 0;
const abstract_service_1 = __importDefault(require("../../../abstract/abstract.service"));
class AdminBannerServie extends abstract_service_1.default {
    constructor() {
        super();
        this.model = this.Model.adminModel();
    }
    //upload Banner Images
    uploadBannerImage(req) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const files = req.files || [];
            if (files.length == 0) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_BAD_REQUEST,
                    message: this.ResMsg.HTTP_BAD_REQUEST,
                };
            }
            const length = files === null || files === void 0 ? void 0 : files.length;
            for (var i = 0; i < length; i++) {
                const banner_image = (_a = files[i]) === null || _a === void 0 ? void 0 : _a.filename;
                const uploadedBannerImage = yield this.model.uploadBannerImage({
                    banner_image: banner_image,
                });
                if (!uploadedBannerImage)
                    return { success: false };
            }
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
            };
        });
    }
    // Get All The Banner Images
    getBannerImage(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const getAllBannerImage = yield this.model.getBannerImage();
            if (!getAllBannerImage)
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.ResMsg.HTTP_NOT_FOUND,
                };
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data: getAllBannerImage,
            };
        });
    }
    // Toggle Image Status
    updateImageStatus(req, id) {
        return __awaiter(this, void 0, void 0, function* () {
            const updated = yield this.model.updateImageStatus(id);
            if (!updated)
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.ResMsg.STATUS_CANNOT_CHANGE,
                };
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
            };
        });
    }
}
exports.AdminBannerServie = AdminBannerServie;
