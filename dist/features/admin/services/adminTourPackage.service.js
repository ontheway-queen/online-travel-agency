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
exports.TourPackageService = void 0;
const abstract_service_1 = __importDefault(require("../../../abstract/abstract.service"));
const constants_1 = require("../../../utils/miscellaneous/constants");
class TourPackageService extends abstract_service_1.default {
    constructor() {
        super();
    }
    //create tour package
    createTourPackage(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { id } = req.admin;
                const _a = req.body, { include_exclude, tour_package_itinerary, tour_package_photos } = _a, rest = __rest(_a, ["include_exclude", "tour_package_itinerary", "tour_package_photos"]);
                const tourPackage = this.Model.tourPackageModel(trx);
                // Handle file uploads
                const files = req.files || [];
                // Create the tour package
                const tour = yield tourPackage.createTourPackage(Object.assign(Object.assign({}, rest), { created_by: id, valid_till_date: new Date(rest.valid_till_date) }));
                const tourId = tour[0].id;
                // Insert tour package photos
                const parsedPhotos = Array.isArray(tour_package_photos)
                    ? tour_package_photos
                    : JSON.parse(tour_package_photos);
                for (let i = 0; i < parsedPhotos.length; i++) {
                    const item = parsedPhotos[i];
                    const photoFile = files.find((file) => file.fieldname === `photo_${i + 1}`);
                    if (photoFile) {
                        yield this.Model.tourPackageModel(trx).insertPackagePhoto(Object.assign(Object.assign({}, item), { tour_id: tourId, photo: photoFile.filename }));
                    }
                    else {
                        console.log(`Warning: No file found for photo_${i + 1}`);
                    }
                }
                // Insert include/exclude items
                const parsedInclude = JSON.parse(include_exclude);
                for (const item of parsedInclude) {
                    yield this.Model.tourPackageModel(trx).createTourPackageIncludeExclude(Object.assign(Object.assign({}, item), { tour_id: tourId }));
                }
                // // Insert tour group itinerary
                const parsedItineraryPhotos = Array.isArray(tour_package_itinerary)
                    ? tour_package_itinerary
                    : JSON.parse(tour_package_itinerary);
                for (let i = 0; i < parsedItineraryPhotos.length; i++) {
                    const item = parsedItineraryPhotos[i];
                    const photoFile = files.find((file) => file.fieldname === `itn_photo_${i + 1}`);
                    if (photoFile) {
                        yield this.Model.tourPackageModel(trx).createTourPackageItinerary(Object.assign(Object.assign({}, item), { tour_id: tourId, photo: photoFile.filename }));
                    }
                    else {
                        console.log(`Warning: No file found for itn_photo_${i + 1}`);
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
    //create tour package V2
    createTourPackageV2(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { id } = req.admin;
                const _a = req.body, { include_services, exclude_services, highlights } = _a, rest = __rest(_a, ["include_services", "exclude_services", "highlights"]);
                const tourPackageModel = this.Model.tourPackageModel(trx);
                // Create the tour package
                const tour = yield tourPackageModel.createTourPackage(Object.assign(Object.assign({}, rest), { created_by: id }));
                const tourId = tour[0].id;
                const files = req.files || [];
                let tour_package_images_body;
                if (files.length) {
                    //insert images
                    tour_package_images_body = files.map((images) => {
                        return {
                            tour_id: tourId,
                            photo: images.filename,
                        };
                    });
                    yield tourPackageModel.insertPackagePhoto(tour_package_images_body);
                }
                //insert services
                const services_body = [
                    ...((include_services === null || include_services === void 0 ? void 0 : include_services.length)
                        ? include_services.map((elem) => ({
                            tour_id: tourId,
                            type: constants_1.TOUR_PACKAGE_INCLUDE_SERVICE,
                            title: elem,
                        }))
                        : []),
                    ...((exclude_services === null || exclude_services === void 0 ? void 0 : exclude_services.length)
                        ? exclude_services.map((elem) => ({
                            tour_id: tourId,
                            type: constants_1.TOUR_PACKAGE_EXCLUDE_SERVICE,
                            title: elem,
                        }))
                        : []),
                    ...((highlights === null || highlights === void 0 ? void 0 : highlights.length)
                        ? highlights.map((elem) => ({
                            tour_id: tourId,
                            type: constants_1.TOUR_PACKAGE_HIGHLIGHT_SERVICE,
                            title: elem,
                        }))
                        : []),
                ];
                if (services_body.length) {
                    yield tourPackageModel.createTourPackageServices(services_body);
                }
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: 'Tour package has been created successfully',
                    data: {
                        tour_id: tourId,
                        images: tour_package_images_body,
                    },
                };
            }));
        });
    }
    //get tour package list
    getAllTourPackage(req) {
        return __awaiter(this, void 0, void 0, function* () {
            // const {
            //   title,
            //   tour_type,
            //   is_featured,
            //   city_id,
            //   country_id,
            //   from_date,
            //   to_date,
            //   status,
            //   limit,
            //   skip,
            //   from_range,
            //   to_range,
            //   sort_by,
            // } = req.query as tourPackageFilterQuery;
            const query = req.query;
            const model = this.Model.tourPackageModel();
            const data = yield model.getTourPackageListV2(query);
            // // Fetch reviews for each tour package
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
    //update single tour package
    updateTourPackage(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { id } = req.admin;
                const tour_package_id = Number(req.params.id);
                //first delete itinerary photos
                //delete tour photo
                //delete itinerary photo
                //then the real update comes
                const _a = req.body, { delete_itinerary_photo, delete_tour_photo, delete_include_exclude, include_exclude, tour_package_itinerary, tour_package_photos } = _a, rest = __rest(_a, ["delete_itinerary_photo", "delete_tour_photo", "delete_include_exclude", "include_exclude", "tour_package_itinerary", "tour_package_photos"]);
                const tourPackage = this.Model.tourPackageModel(trx);
                // Handle file uploads
                const files = req.files || [];
                //delete itn photo
                const del_itn_photo = JSON.parse(delete_itinerary_photo);
                for (const photo_itn of del_itn_photo) {
                    yield tourPackage.deleteItineraryPhoto(photo_itn);
                }
                //delete tour photo
                const del_tour_photo = JSON.parse(delete_tour_photo);
                for (const photo_tour of del_tour_photo) {
                    yield tourPackage.deleteTourPhoto(photo_tour);
                }
                //delete include_exclude
                const del_include_exclude = JSON.parse(delete_include_exclude);
                for (const del_inc_exc of del_include_exclude) {
                    yield tourPackage.deleteIncludeExclude(del_inc_exc);
                }
                //tour package updated
                yield tourPackage.updateTourPackage(tour_package_id, Object.assign(Object.assign({}, rest), { created_by: id, valid_till_date: new Date(rest.valid_till_date) }));
                const tourId = tour_package_id;
                const itineraryPhotos = [];
                const packagePhotos = [];
                console.log('Itinerary photos:', itineraryPhotos); // Debug log
                console.log('Package photos:', packagePhotos); // Debug log
                // // ... (rest of the code remains the same)
                // // Insert tour package photos
                const parsedPhotos = Array.isArray(tour_package_photos)
                    ? tour_package_photos
                    : JSON.parse(tour_package_photos);
                for (let i = 0; i < parsedPhotos.length; i++) {
                    const item = parsedPhotos[i];
                    const photoFile = files.find((file) => file.fieldname === `photo_${i + 1}`);
                    if (photoFile) {
                        yield this.Model.tourPackageModel(trx).insertPackagePhoto(Object.assign(Object.assign({}, item), { tour_id: tourId, photo: photoFile.filename }));
                    }
                    else {
                        console.log(`Warning: No file found for photo_${i + 1}`);
                    }
                }
                // Insert include/exclude items
                const parsedInclude = JSON.parse(include_exclude);
                for (const item of parsedInclude) {
                    yield this.Model.tourPackageModel(trx).createTourPackageIncludeExclude(Object.assign(Object.assign({}, item), { tour_id: tourId }));
                }
                // Insert tour group itinerary
                const parsedItineraryPhotos = Array.isArray(tour_package_itinerary)
                    ? tour_package_itinerary
                    : JSON.parse(tour_package_itinerary);
                for (let i = 0; i < parsedItineraryPhotos.length; i++) {
                    const item = parsedItineraryPhotos[i];
                    const photoFile = files.find((file) => file.fieldname === `itn_photo_${i + 1}`);
                    if (photoFile) {
                        yield this.Model.tourPackageModel(trx).createTourPackageItinerary(Object.assign(Object.assign({}, item), { tour_id: tourId, photo: photoFile.filename }));
                    }
                    else {
                        console.log(`Warning: No file found for itn_photo_${i + 1}`);
                    }
                }
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: 'Tour Package Updated Successful',
                };
            }));
        });
    }
    //update single tour package V2
    updateTourPackageV2(req) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.transaction((trx) => __awaiter(this, void 0, void 0, function* () {
                const { id } = req.admin;
                const tour_id = Number(req.params.id);
                const model = this.Model.tourPackageModel(trx);
                const _a = req.body, { delete_photos, add_include_service, add_exclude_service, add_highlight_service, update_include_service, update_exclude_service, update_highlight_service, delete_include_service, delete_exclude_service, delete_highlight_service } = _a, rest = __rest(_a, ["delete_photos", "add_include_service", "add_exclude_service", "add_highlight_service", "update_include_service", "update_exclude_service", "update_highlight_service", "delete_include_service", "delete_exclude_service", "delete_highlight_service"]);
                // console.log(req.body);
                //update tour package
                if (rest) {
                    yield model.updateTourPackage(tour_id, rest);
                }
                //update photos
                const files = req.files || [];
                const insert_photo_body = files.map((elem) => {
                    return { tour_id, photo: elem.filename };
                });
                if (insert_photo_body.length) {
                    yield model.insertPackagePhoto(insert_photo_body);
                }
                if (delete_photos) {
                    const delete_photo_promise = delete_photos.map((elem) => __awaiter(this, void 0, void 0, function* () {
                        yield model.deleteTourPhoto(elem);
                    }));
                    yield Promise.all(delete_photo_promise);
                }
                //insert services
                if (add_include_service || add_exclude_service || add_highlight_service) {
                    const add_services_body = [
                        ...((add_include_service === null || add_include_service === void 0 ? void 0 : add_include_service.length)
                            ? add_include_service.map((elem) => ({
                                tour_id: tour_id,
                                type: constants_1.TOUR_PACKAGE_INCLUDE_SERVICE,
                                title: elem,
                            }))
                            : []),
                        ...((add_exclude_service === null || add_exclude_service === void 0 ? void 0 : add_exclude_service.length)
                            ? add_exclude_service.map((elem) => ({
                                tour_id: tour_id,
                                type: constants_1.TOUR_PACKAGE_EXCLUDE_SERVICE,
                                title: elem,
                            }))
                            : []),
                        ...((add_highlight_service === null || add_highlight_service === void 0 ? void 0 : add_highlight_service.length)
                            ? add_highlight_service.map((elem) => ({
                                tour_id: tour_id,
                                type: constants_1.TOUR_PACKAGE_HIGHLIGHT_SERVICE,
                                title: elem,
                            }))
                            : []),
                    ];
                    yield model.createTourPackageServices(add_services_body);
                }
                //update services
                if (update_include_service) {
                    // console.log(update_include_service);
                    const update_include_body = update_include_service.map((elem) => __awaiter(this, void 0, void 0, function* () {
                        yield model.updateTourService(elem.id, elem.title);
                    }));
                    yield Promise.all(update_include_body);
                }
                if (update_exclude_service) {
                    const update_exclude_body = update_exclude_service.map((elem) => __awaiter(this, void 0, void 0, function* () {
                        yield model.updateTourService(elem.id, elem.title);
                    }));
                    yield Promise.all(update_exclude_body);
                }
                if (update_highlight_service) {
                    const update_highlight_body = update_highlight_service.map((elem) => __awaiter(this, void 0, void 0, function* () {
                        yield model.updateTourService(elem.id, elem.title);
                    }));
                    yield Promise.all(update_highlight_body);
                }
                //delete services
                if (delete_include_service) {
                    const delete_include_body = delete_include_service.map((elem) => __awaiter(this, void 0, void 0, function* () {
                        yield model.deleteTourService(elem);
                    }));
                    yield Promise.all(delete_include_body);
                }
                if (delete_exclude_service) {
                    const delete_exclude_body = delete_exclude_service.map((elem) => __awaiter(this, void 0, void 0, function* () {
                        yield model.deleteTourService(elem);
                    }));
                    yield Promise.all(delete_exclude_body);
                }
                if (delete_highlight_service) {
                    const delete_highlight_body = delete_highlight_service.map((elem) => __awaiter(this, void 0, void 0, function* () {
                        yield model.deleteTourService(elem);
                    }));
                    yield Promise.all(delete_highlight_body);
                }
                return {
                    success: true,
                    code: this.StatusCode.HTTP_SUCCESSFUL,
                    message: 'Tour Package Updated Successful',
                };
            }));
        });
    }
    //delete single tour package
    deleteTourPackage(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const id = Number(req.params.id);
            const data = yield this.Model.tourPackageModel().deleteTourPackage(id);
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: 'Tour Package Has Been Deleted Successfully',
            };
        });
    }
    // get all tour package request
    getTourPackageRequest(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = req.query;
            const model = this.Model.tourPackageModel();
            const { data, total } = yield model.getTourPackageRequests(query);
            return {
                success: true,
                code: this.StatusCode.HTTP_OK,
                message: this.ResMsg.HTTP_OK,
                total,
                data,
            };
        });
    }
    // update tour package request
    updateTourPackageRequest(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const model = this.Model.tourPackageModel();
            const { id } = req.params;
            const body = req.body;
            const check_request = yield model.singleTourPackageRequest({
                id: Number(id),
            });
            if (!check_request.length) {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_NOT_FOUND,
                    message: this.ResMsg.HTTP_NOT_FOUND,
                };
            }
            const res = yield model.updateTourPackageRequest({ id: Number(id) }, body);
            if (res.length) {
                return {
                    success: true,
                    code: this.StatusCode.HTTP_OK,
                    message: this.ResMsg.HTTP_OK,
                    data: {
                        id,
                    },
                };
            }
            else {
                return {
                    success: false,
                    code: this.StatusCode.HTTP_CONFLICT,
                    message: 'the tour package request is not updated',
                };
            }
        });
    }
}
exports.TourPackageService = TourPackageService;
