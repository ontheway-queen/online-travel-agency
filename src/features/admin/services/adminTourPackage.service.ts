import { Request } from 'express';
import AbstractServices from '../../../abstract/abstract.service';

import {
  TOUR_PACKAGE_EXCLUDE_SERVICE,
  TOUR_PACKAGE_HIGHLIGHT_SERVICE,
  TOUR_PACKAGE_INCLUDE_SERVICE,
} from '../../../utils/miscellaneous/constants';

export class TourPackageService extends AbstractServices {
  constructor() {
    super();
  }

  //create tour package
  public async createTourPackage(req: Request) {
    return this.db.transaction(async (trx) => {
      const { id } = req.admin;
      const {
        include_exclude,
        tour_package_itinerary,
        tour_package_photos,
        ...rest
      } = req.body;


      const tourPackage = this.Model.tourPackageModel(trx);
      // Handle file uploads
      const files = (req.files as Express.Multer.File[]) || [];

  

      // Create the tour package
      const tour = await tourPackage.createTourPackage({
        ...rest,
        created_by: id,
        valid_till_date: new Date(rest.valid_till_date),
      });

      const tourId = tour[0].id;


      // Insert tour package photos
      const parsedPhotos = Array.isArray(tour_package_photos)
        ? tour_package_photos
        : JSON.parse(tour_package_photos);

      for (let i = 0; i < parsedPhotos.length; i++) {
        const item = parsedPhotos[i];
        const photoFile = files.find(
          (file) => file.fieldname === `photo_${i + 1}`
        );

        if (photoFile) {
          await this.Model.tourPackageModel(trx).insertPackagePhoto({
            ...item,
            tour_id: tourId,
            photo: photoFile.filename, // Assuming Multer saves the file and provides the filename
          });
        } else {
          console.log(`Warning: No file found for photo_${i + 1}`);
        }
      }

      // Insert include/exclude items
      const parsedInclude = JSON.parse(include_exclude);
      for (const item of parsedInclude) {
        await this.Model.tourPackageModel(trx).createTourPackageIncludeExclude({
          ...item,
          tour_id: tourId,
        });
      }

      // // Insert tour group itinerary
      const parsedItineraryPhotos = Array.isArray(tour_package_itinerary)
        ? tour_package_itinerary
        : JSON.parse(tour_package_itinerary);

      for (let i = 0; i < parsedItineraryPhotos.length; i++) {
        const item = parsedItineraryPhotos[i];
        const photoFile = files.find(
          (file) => file.fieldname === `itn_photo_${i + 1}`
        );

        if (photoFile) {
          await this.Model.tourPackageModel(trx).createTourPackageItinerary({
            ...item,
            tour_id: tourId,
            photo: photoFile.filename, // Assuming Multer saves the file and provides the filename
          });
        } else {
          console.log(`Warning: No file found for itn_photo_${i + 1}`);
        }
      }

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: this.ResMsg.HTTP_SUCCESSFUL,
      };
    });
  }

  //create tour package V2
  public async createTourPackageV2(req: Request) {
    return this.db.transaction(async (trx) => {
      const { id } = req.admin;
      const { include_services, exclude_services, highlights, ...rest } =
        req.body;

      const tourPackageModel = this.Model.tourPackageModel(trx);

      // Create the tour package
      const tour = await tourPackageModel.createTourPackage({
        ...rest,
        created_by: id,
      });

      const tourId = tour[0].id;

      const files = (req.files as Express.Multer.File[]) || [];

      let tour_package_images_body;
      if (files.length) {
        //insert images
        tour_package_images_body = files.map((images) => {
          return {
            tour_id: tourId,
            photo: images.filename,
          };
        });
        await tourPackageModel.insertPackagePhoto(tour_package_images_body);
      }

      //insert services
      const services_body = [
        ...(include_services?.length
          ? include_services.map((elem: string) => ({
              tour_id: tourId,
              type: TOUR_PACKAGE_INCLUDE_SERVICE,
              title: elem,
            }))
          : []),
        ...(exclude_services?.length
          ? exclude_services.map((elem: string) => ({
              tour_id: tourId,
              type: TOUR_PACKAGE_EXCLUDE_SERVICE,
              title: elem,
            }))
          : []),
        ...(highlights?.length
          ? highlights.map((elem: string) => ({
              tour_id: tourId,
              type: TOUR_PACKAGE_HIGHLIGHT_SERVICE,
              title: elem,
            }))
          : []),
      ];

      if (services_body.length) {
        await tourPackageModel.createTourPackageServices(services_body);
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
    });
  }

  //get tour package list
  public async getAllTourPackage(req: Request) {
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
    const data = await model.getTourPackageListV2(query);

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
  }

  //get single tour package
  public async getSingleTourPackage(req: Request) {
    const id = Number(req.params.id);

    const data = await this.Model.tourPackageModel().getSingleTourPackage(id);
    const photos = await this.Model.tourPackageModel().getTourPhotos(id);
    const include_services =
      await this.Model.tourPackageModel().getTourServices(
        id,
        TOUR_PACKAGE_INCLUDE_SERVICE
      );
    const exclude_services =
      await this.Model.tourPackageModel().getTourServices(
        id,
        TOUR_PACKAGE_EXCLUDE_SERVICE
      );
    const highlight_services =
      await this.Model.tourPackageModel().getTourServices(
        id,
        TOUR_PACKAGE_HIGHLIGHT_SERVICE
      );

    // const reviews = await this.Model.tourPackageModel().getAllTourPackesReview({
    //   tour_id: id,
    // });
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      data: {
        ...data[0],
        photos,
        include_services,
        exclude_services,
        highlight_services,
        // reviews,
      },
    };
  }

  //update single tour package
  public async updateTourPackage(req: Request) {
    return this.db.transaction(async (trx) => {
      const { id } = req.admin;
      const tour_package_id = Number(req.params.id);

      //first delete itinerary photos

      //delete tour photo

      //delete itinerary photo

      //then the real update comes

      const {
        delete_itinerary_photo,
        delete_tour_photo,
        delete_include_exclude,
        include_exclude,
        tour_package_itinerary,
        tour_package_photos,
        ...rest
      } = req.body;

      const tourPackage = this.Model.tourPackageModel(trx);
      // Handle file uploads
      const files = (req.files as Express.Multer.File[]) || [];

      //delete itn photo
      const del_itn_photo = JSON.parse(delete_itinerary_photo);
      for (const photo_itn of del_itn_photo) {
        await tourPackage.deleteItineraryPhoto(photo_itn);
      }

      //delete tour photo
      const del_tour_photo = JSON.parse(delete_tour_photo);
      for (const photo_tour of del_tour_photo) {
        await tourPackage.deleteTourPhoto(photo_tour);
      }

      //delete include_exclude
      const del_include_exclude = JSON.parse(delete_include_exclude);
      for (const del_inc_exc of del_include_exclude) {
        await tourPackage.deleteIncludeExclude(del_inc_exc);
      }

      //tour package updated
      await tourPackage.updateTourPackage(tour_package_id, {
        ...rest,
        created_by: id,
        valid_till_date: new Date(rest.valid_till_date),
      });

      const tourId = tour_package_id;

      const itineraryPhotos: string[] = [];
      const packagePhotos: string[] = [];

      console.log('Itinerary photos:', itineraryPhotos); // Debug log
      console.log('Package photos:', packagePhotos); // Debug log

      // // ... (rest of the code remains the same)

      // // Insert tour package photos
      const parsedPhotos = Array.isArray(tour_package_photos)
        ? tour_package_photos
        : JSON.parse(tour_package_photos);

      for (let i = 0; i < parsedPhotos.length; i++) {
        const item = parsedPhotos[i];
        const photoFile = files.find(
          (file) => file.fieldname === `photo_${i + 1}`
        );

        if (photoFile) {
          await this.Model.tourPackageModel(trx).insertPackagePhoto({
            ...item,
            tour_id: tourId,
            photo: photoFile.filename, // Assuming Multer saves the file and provides the filename
          });
        } else {
          console.log(`Warning: No file found for photo_${i + 1}`);
        }
      }

      // Insert include/exclude items
      const parsedInclude = JSON.parse(include_exclude);
      for (const item of parsedInclude) {
        await this.Model.tourPackageModel(trx).createTourPackageIncludeExclude({
          ...item,
          tour_id: tourId,
        });
      }

      // Insert tour group itinerary
      const parsedItineraryPhotos = Array.isArray(tour_package_itinerary)
        ? tour_package_itinerary
        : JSON.parse(tour_package_itinerary);

      for (let i = 0; i < parsedItineraryPhotos.length; i++) {
        const item = parsedItineraryPhotos[i];
        const photoFile = files.find(
          (file) => file.fieldname === `itn_photo_${i + 1}`
        );

        if (photoFile) {
          await this.Model.tourPackageModel(trx).createTourPackageItinerary({
            ...item,
            tour_id: tourId,
            photo: photoFile.filename, // Assuming Multer saves the file and provides the filename
          });
        } else {
          console.log(`Warning: No file found for itn_photo_${i + 1}`);
        }
      }

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: 'Tour Package Updated Successful',
      };
    });
  }

  //update single tour package V2
  public async updateTourPackageV2(req: Request) {
    return this.db.transaction(async (trx) => {
      const { id } = req.admin;
      const tour_id = Number(req.params.id);
      const model = this.Model.tourPackageModel(trx);

      const {
        delete_photos,
        add_include_service,
        add_exclude_service,
        add_highlight_service,
        update_include_service,
        update_exclude_service,
        update_highlight_service,
        delete_include_service,
        delete_exclude_service,
        delete_highlight_service,
        ...rest
      } = req.body;

      // console.log(req.body);

      //update tour package
      if (rest) {
        await model.updateTourPackage(tour_id, rest);
      }

      //update photos
      const files = (req.files as Express.Multer.File[]) || [];
      const insert_photo_body = files.map((elem) => {
        return { tour_id, photo: elem.filename };
      });
      if (insert_photo_body.length) {
        await model.insertPackagePhoto(insert_photo_body);
      }
      if (delete_photos) {
        const delete_photo_promise = delete_photos.map(async (elem: number) => {
          await model.deleteTourPhoto(elem);
        });
        await Promise.all(delete_photo_promise);
      }

      //insert services
      if (add_include_service || add_exclude_service || add_highlight_service) {
        const add_services_body = [
          ...(add_include_service?.length
            ? add_include_service.map((elem: string) => ({
                tour_id: tour_id,
                type: TOUR_PACKAGE_INCLUDE_SERVICE,
                title: elem,
              }))
            : []),
          ...(add_exclude_service?.length
            ? add_exclude_service.map((elem: string) => ({
                tour_id: tour_id,
                type: TOUR_PACKAGE_EXCLUDE_SERVICE,
                title: elem,
              }))
            : []),
          ...(add_highlight_service?.length
            ? add_highlight_service.map((elem: string) => ({
                tour_id: tour_id,
                type: TOUR_PACKAGE_HIGHLIGHT_SERVICE,
                title: elem,
              }))
            : []),
        ];
        await model.createTourPackageServices(add_services_body);
      }

      //update services
      if (update_include_service) {
        // console.log(update_include_service);
        const update_include_body = update_include_service.map(
          async (elem: { id: number; title: string }) => {
            await model.updateTourService(elem.id, elem.title);
          }
        );
        await Promise.all(update_include_body);
      }
      if (update_exclude_service) {
        const update_exclude_body = update_exclude_service.map(
          async (elem: { id: number; title: string }) => {
            await model.updateTourService(elem.id, elem.title);
          }
        );
        await Promise.all(update_exclude_body);
      }
      if (update_highlight_service) {
        const update_highlight_body = update_highlight_service.map(
          async (elem: { id: number; title: string }) => {
            await model.updateTourService(elem.id, elem.title);
          }
        );
        await Promise.all(update_highlight_body);
      }

      //delete services
      if (delete_include_service) {
        const delete_include_body = delete_include_service.map(
          async (elem: number) => {
            await model.deleteTourService(elem);
          }
        );
        await Promise.all(delete_include_body);
      }
      if (delete_exclude_service) {
        const delete_exclude_body = delete_exclude_service.map(
          async (elem: number) => {
            await model.deleteTourService(elem);
          }
        );
        await Promise.all(delete_exclude_body);
      }
      if (delete_highlight_service) {
        const delete_highlight_body = delete_highlight_service.map(
          async (elem: number) => {
            await model.deleteTourService(elem);
          }
        );
        await Promise.all(delete_highlight_body);
      }

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: 'Tour Package Updated Successful',
      };
    });
  }

  //delete single tour package
  public async deleteTourPackage(req: Request) {
    const id = Number(req.params.id);

    const data = await this.Model.tourPackageModel().deleteTourPackage(id);

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: 'Tour Package Has Been Deleted Successfully',
    };
  }

  // get all tour package request
  public async getTourPackageRequest(req: Request) {
    const query = req.query;
    const model = this.Model.tourPackageModel();
    const { data, total } = await model.getTourPackageRequests(query);

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      total,
      data,
    };
  }

  // update tour package request
  public async updateTourPackageRequest(req: Request) {
    const model = this.Model.tourPackageModel();
    const { id } = req.params;
    const body = req.body;

    const check_request = await model.singleTourPackageRequest({
      id: Number(id),
    });

    if (!check_request.length) {
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: this.ResMsg.HTTP_NOT_FOUND,
      };
    }

    const res = await model.updateTourPackageRequest({ id: Number(id) }, body);

    if (res.length) {
      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: this.ResMsg.HTTP_OK,
        data: {
          id,
        },
      };
    } else {
      return {
        success: false,
        code: this.StatusCode.HTTP_CONFLICT,
        message: 'the tour package request is not updated',
      };
    }
  }
}
