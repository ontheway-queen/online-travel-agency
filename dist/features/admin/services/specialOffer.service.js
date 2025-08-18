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
class SpecialOfferService extends abstract_service_1.default {
    // create special offers
    createSpecialOffer(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction(() => __awaiter(this, void 0, void 0, function* () {
                const { id } = req.admin;
                const model = this.Model.specialOfferModel();
                const body = req.body;
                const files = req.files || [];
                body.created_by = id;
                // Ensure files array length doesn't exceed 2
                if (files.length > 1) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_CONFLICT,
                        message: "Only one image or one video file are allowed",
                    };
                }
                for (const file of files) {
                    if (file.fieldname === "photo") {
                        // Validate image file
                        body["photo"] = file.filename; // Store image filename in the database
                    }
                    else if (file.fieldname === "video") {
                        // Validate video file
                        body["video"] = file.filename; // Store video filename in the database
                    }
                    else {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_CONFLICT,
                            message: `Unknown file field name: ${file.fieldname}`,
                        };
                    }
                }
                const res = yield model.insertSpecialOffer(body);
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: this.ResMsg.HTTP_SUCCESSFUL,
                    data: {
                        id: res[0].id,
                    },
                };
            }));
        });
    }
    updateSpecialOffer(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction(() => __awaiter(this, void 0, void 0, function* () {
                const { id } = req.params;
                const body = req.body;
                const files = req.files || [];
                const model = this.Model.specialOfferModel();
                const single_offer = yield model.getSingleSpecialOffer({
                    id: Number(id),
                });
                if (!single_offer.length) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_NOT_FOUND,
                        message: this.ResMsg.HTTP_NOT_FOUND,
                    };
                }
                if (files.length > 1) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_CONFLICT,
                        message: "file can not be greater than 1",
                    };
                }
                if (files.length === 1) {
                    const file = files[0];
                    if (file.fieldname === "photo") {
                        body["photo"] = file.filename;
                    }
                    else if (file.fieldname === "video") {
                        body["video"] = file.filename;
                    }
                    else {
                        return {
                            success: false,
                            code: this.StatusCode.HTTP_CONFLICT,
                            message: "unknown file name",
                        };
                    }
                }
                const res = yield model.updateSpecialOffer({ id: Number(id) }, body);
                if (files.length > 0) {
                    const file = files[0];
                    const photo = single_offer[0].photo;
                    if (file.fieldname === "photo" && photo) {
                        this.manageFile.deleteFromCloud([photo]);
                    }
                }
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_OK,
                    data: {
                        id,
                    },
                };
            }));
        });
    }
    // get all speacial offers
    getSpecialOffers(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = this.Model.specialOfferModel();
            const { key, limit, skip, type, status, panel } = req.query;
            const { data, total } = yield model.getSpecialOffers({
                key,
                limit,
                skip,
                type,
                status,
                panel
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                total,
                data,
            };
        });
    }
    // get single speacial offer
    getSingleSpecialOffer(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const model = this.Model.specialOfferModel();
            const single_offer = yield model.getSingleSpecialOffer({ id: Number(id) });
            if (!single_offer.length) {
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
                data: single_offer[0],
            };
        });
    }
    // delete single special offer
    deleteSingleSpecialOffer(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const model = this.Model.specialOfferModel();
            const single_offer = yield model.getSingleSpecialOffer({ id: Number(id) });
            if (!single_offer.length) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.ResMsg.HTTP_NOT_FOUND,
                };
            }
            const res = yield model.deleteSingleSpecialOffer({ id: Number(id) });
            if (res.length) {
                if (single_offer[0].photo) {
                    this.manageFile.deleteFromCloud([single_offer[0].photo]);
                }
            }
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data: {
                    id,
                },
            };
        });
    }
}
exports.default = SpecialOfferService;
