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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UmrahPackageService = void 0;
const abstract_service_1 = __importDefault(require("../../../abstract/abstract.service"));
class UmrahPackageService extends abstract_service_1.default {
    constructor() {
        super();
    }
    // Create Umrah Package
    createUmrahPackage(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                var _a, _b;
                const model = this.Model.umrahPackageModel(trx);
                const files = req.files || [];
                const _c = req.body, { package_details, include, package_name } = _c, rest = __rest(_c, ["package_details", "include", "package_name"]);
                // check slug already exist or not
                const slug = package_name.toLowerCase().replace(/ /g, "-");
                const check_slug = yield model.getSingleUmrahPackage(undefined, slug);
                if (check_slug) {
                    return {
                        success: false,
                        code: this.StatusCode.HTTP_CONFLICT,
                        message: this.ResMsg.SLUG_EXISTS,
                    };
                }
                // create umrah package
                const createdPackage = yield model.createUmrahPackage(Object.assign(Object.assign({}, rest), { package_name,
                    slug, created_by: req.admin.id }));
                const umrah_id = (_a = createdPackage[0]) === null || _a === void 0 ? void 0 : _a.id;
                //add include exclude
                if (umrah_id && include) {
                    const include_parse = JSON.parse(include);
                    if (include_parse.length) {
                        for (const item of include_parse) {
                            yield model.insertPackageIncludeExclude({
                                include_exclude_id: item,
                                umrah_id: Number(umrah_id),
                            });
                        }
                    }
                }
                // create package details
                if (umrah_id && Array.isArray(package_details)) {
                    for (const item of package_details) {
                        const { details_title, details_description, type } = item;
                        yield model.createUmrahPackageDetails({
                            details_title,
                            details_description,
                            type,
                            umrah_id: umrah_id,
                        });
                    }
                }
                // upload umrah image
                if (files === null || files === void 0 ? void 0 : files.length) {
                    const length = files === null || files === void 0 ? void 0 : files.length;
                    for (var i = 0; i < length; i++) {
                        const photo = (_b = files[i]) === null || _b === void 0 ? void 0 : _b.filename;
                        const uploadedUmrahPackageImage = yield model.uplaodUmrahPackageImage({
                            photo: photo,
                            umrah_id: umrah_id,
                        });
                        if (!uploadedUmrahPackageImage)
                            return {
                                success: false,
                                code: this.StatusCode.HTTP_BAD_REQUEST,
                                message: this.ResMsg.HTTP_BAD_REQUEST,
                            };
                    }
                }
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: this.ResMsg.HTTP_SUCCESSFUL,
                };
            }));
        });
    }
    // Get All the umrah package from admin
    getAllUmrahPackage(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = this.Model.umrahPackageModel();
            const { page, limit, title, to_date, status, is_deleted } = req.query;
            const offset = (page - 1) * limit;
            const getAllUmrahPackage = yield model.getAllUmrahPackage({
                limit,
                title,
                offset,
                to_date,
                status,
                is_deleted,
            });
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                total: parseInt(getAllUmrahPackage.umrahPackageCount[0].total),
                page: page,
                limit: limit,
                data: getAllUmrahPackage.umrahPackage,
            };
        });
    }
    // Get Single Umrah Package for admin
    getSingleUmrahPackage(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = this.Model.umrahPackageModel();
            const { id } = req.params;
            const singlePackage = yield model.getSingleUmrahPackage(id);
            if (!singlePackage)
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.ResMsg.HTTP_NOT_FOUND,
                };
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data: singlePackage,
            };
        });
    }
    // Update Umrah Package
    updateUmrahPackage(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = this.Model.umrahPackageModel();
            const { id } = req.params;
            const _a = req.body, { remove_image, package_details, remove_include, include, package_name } = _a, rest = __rest(_a, ["remove_image", "package_details", "remove_include", "include", "package_name"]);
            const slug = package_name.toLowerCase().replace(/ /g, "-");
            const check_slug = yield model.getSlugCheck(id, slug);
            if (check_slug.length) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_CONFLICT,
                    message: this.ResMsg.SLUG_EXISTS,
                };
            }
            const umrahPackage = yield model.getSingleUmrahPackage(id);
            if (!umrahPackage) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.ResMsg.HTTP_NOT_FOUND,
                };
            }
            // Add includes
            if (include) {
                const includeItems = JSON.parse(include);
                if (includeItems.length) {
                    const umrahInclude = (umrahPackage === null || umrahPackage === void 0 ? void 0 : umrahPackage.include) || [];
                    const dbIds = umrahInclude.map((item) => item.id);
                    const nonMatchingItems = includeItems.filter((item) => !dbIds.includes(item));
                    yield Promise.all(nonMatchingItems.map((item) => model.insertPackageIncludeExclude({
                        include_exclude_id: item,
                        umrah_id: Number(umrahPackage.id),
                    })));
                }
            }
            // Delete includes
            if (remove_include) {
                const removeIncludeItems = JSON.parse(remove_include);
                yield Promise.all(removeIncludeItems.map((includeId) => model.deleteIncludeExclude(includeId)));
            }
            // Delete package details if they don’t match current details
            if (Array.isArray(package_details)) {
                const umrahPackageDetails = (umrahPackage === null || umrahPackage === void 0 ? void 0 : umrahPackage.package_details) || [];
                const deleteDetailsPromises = umrahPackageDetails
                    .filter((detail) => !package_details.some((d) => d.id === detail.id))
                    .map((detail) => model.deleteUmrahPackageDetails(detail.id));
                yield Promise.all(deleteDetailsPromises);
                // Update or create new package details
                yield Promise.all(package_details.map((details) => __awaiter(this, void 0, void 0, function* () {
                    const { id } = details, restDetails = __rest(details, ["id"]);
                    return id
                        ? model.updateUmrahPackageDetails(restDetails, id)
                        : model.createUmrahPackageDetails(Object.assign({ umrah_id: umrahPackage.id }, restDetails));
                })));
            }
            // Remove images
            if (remove_image) {
                const imageIds = JSON.parse(remove_image);
                const filesToDelete = umrahPackage.images
                    .filter((img) => imageIds.includes(img.id))
                    .map((img) => img.photo);
                yield this.manageFile.deleteFromCloud(filesToDelete);
                yield Promise.all(imageIds.map((id) => model.deleteUmrahPackageImage(id)));
            }
            // Upload new images
            const files = req.files || [];
            if (files.length) {
                yield Promise.all(files.map((file) => model.uplaodUmrahPackageImage({
                    photo: file.filename,
                    umrah_id: id,
                })));
            }
            // Update umrah package
            yield model.updateUmrahPackage(Object.assign({ package_name, slug }, rest), id);
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
            };
        });
    }
    //get include exclude item
    getIncludeExcludeItems(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = this.Model.umrahPackageModel();
            const include_exclude = yield model.getIncludeExcludeItems();
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                data: include_exclude,
            };
        });
    }
    // create Details Description
    createDetailDescription(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const model = this.Model.umrahPackageModel(trx);
                const files = req.files || [];
                const reqBody = Object.assign({}, req.body);
                if (files.length) {
                    reqBody.cover_img = files[0].filename;
                }
                yield model.createDetailDescription(reqBody);
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: this.ResMsg.HTTP_SUCCESSFUL,
                };
            }));
        });
    }
}
exports.UmrahPackageService = UmrahPackageService;
