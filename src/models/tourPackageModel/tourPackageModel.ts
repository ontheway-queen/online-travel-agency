import { TDB } from '../../features/public/utils/types/commonTypes';
import {
  ICreateTourPackagePayload,
  ICreateTourPackageServicesPayload,
  IInsertPackageInEx,
  IInsertPackageItinerary,
  IInsertPackagePhoto,
  ITourPackageRequestParams,
  ITourPackageRequestPayload,
  ITourPackageReviewParams,
  ITourPackageReviewPayload,
  ITourPackageReviewPhotoPayload,
  IUpdateTourPackagePayload,
  tourPackageFilterQuery,
} from '../../utils/interfaces/tourPackage/tourPackageInterface';
import Schema from '../../utils/miscellaneous/schema';
import { IInsertBookingRequestPayload } from './../../utils/interfaces/booking/bookingRequest.interface';

export class TourPackageModel extends Schema {
  private db: TDB;
  constructor(db: TDB) {
    super();
    this.db = db;
  }

  // Create tour package
  public async createTourPackage(payload: ICreateTourPackagePayload) {
    return await this.db('tour_package')
      .withSchema(this.SERVICE_SCHEMA)
      .insert(payload)
      .returning('id');
  }

  //create tour package services
  public async createTourPackageServices(
    payload:
      | ICreateTourPackageServicesPayload
      | ICreateTourPackageServicesPayload[]
  ) {
    return await this.db('tour_package_services')
      .withSchema(this.SERVICE_SCHEMA)
      .insert(payload, 'id');
  }

  // update tour package
  public async updateTourPackage(
    id: Number,
    payload: IUpdateTourPackagePayload
  ) {
    return await this.db('tour_package')
      .withSchema(this.SERVICE_SCHEMA)
      .where({ id })
      .update(payload);
  }

  // Insert tour package photos
  public async insertPackagePhoto(
    payload: IInsertPackagePhoto | IInsertPackagePhoto[]
  ) {
    return await this.db('tour_package_photos')
      .withSchema(this.SERVICE_SCHEMA)
      .insert(payload);
  }

  // Create Tour package itinerary
  public async createTourPackageItinerary(
    payload: IInsertPackageItinerary | IInsertPackageItinerary[]
  ) {
    return await this.db('tour_package_itinerary')
      .withSchema(this.SERVICE_SCHEMA)
      .insert(payload);
  }

  // Create Tour package included/excluded
  public async createTourPackageIncludeExclude(
    payload: IInsertPackageInEx | IInsertPackageInEx[]
  ) {
    return await this.db('tour_package_include_exclude')
      .withSchema(this.SERVICE_SCHEMA)
      .insert(payload);
  }

  //list of articles
  public async getTourPackageList(params: tourPackageFilterQuery) {
    // console.log(params);
    const data = await this.db('tour_package as tp')
      .withSchema(this.SERVICE_SCHEMA)
      .select(
        'tp.id',
        'cnt.id as country_id',
        'tp.city_id',
        'tp.title',
        'tp.details',
        'tp.tour_type',
        'tp.duration',
        'tp.adult_price',
        'tp.child_price',
        'tp.discount',
        'tp.discount_type',
        'tp.is_featured',
        'tp.valid_till_date',
        'tp.group_size',
        'tp.status',
        'tp.is_deleted',
        'tp.created_at',
        'tp.created_by',
        'c.name as city_name',
        'cnt.name as country_name'
      )
      .joinRaw('LEFT JOIN public.city AS c ON tp.city_id = c.id')
      .joinRaw('LEFT JOIN public.country AS cnt ON c.country_id = cnt.id')
      .where((qb) => {
        if (params.status) {
          qb.where('tp.status', params.status);
        }
        if (params.country_id) {
          qb.where('cnt.id', params.country_id);
        }
        if (params.city_id) {
          qb.where('c.id', params.city_id);
        }
        if (params.is_featured) {
          qb.where('tp.is_featured', params.is_featured);
        }
        if (params.title) {
          qb.where('tp.title', 'ilike', `%${params.title}%`);
        }
        if (params.tour_type) {
          qb.where('tp.tour_type', 'ilike', `%${params.tour_type}%`);
        }
        if (params.from_range && params.to_range) {
          qb.whereBetween('tp.adult_price', [
            params.from_range,
            params.to_range,
          ]);
        }
        if (params.from_date && params.to_date) {
          const fromDate = new Date(params.from_date).toISOString();

          // Create a Date object for to_date and add 1 day
          const toDate = new Date(params.to_date);
          toDate.setDate(toDate.getDate() + 1); // Add one day

          // Set the new date to the beginning of the day (00:00:00.000)
          toDate.setUTCHours(0, 0, 0, 0);

          qb.whereBetween('tp.valid_till_date', [
            fromDate,
            toDate.toISOString(),
          ]);
        }
      })
      .andWhere('tp.is_deleted', false)
      .orderBy(
        'tp.adult_price',
        params.sort_by === 'high_to_low' ? 'desc' : 'asc'
      )
      .limit(params.limit ? params.limit : 100)
      .offset(params.skip ? params.skip : 0);

    const total = await this.db('tour_package as tp')
      .withSchema(this.SERVICE_SCHEMA)
      .count('tp.id as total')
      .joinRaw('LEFT JOIN public.city AS c ON tp.city_id = c.id')
      .joinRaw('LEFT JOIN public.country AS cnt ON c.country_id = cnt.id')
      .where((qb) => {
        if (params.status) {
          qb.where('tp.status', params.status);
        }
        if (params.country_id) {
          qb.where('cnt.id', params.country_id);
        }
        if (params.city_id) {
          qb.where('c.id', params.city_id);
        }
        if (params.is_featured) {
          qb.where('tp.is_featured', params.is_featured);
        }
        if (params.title) {
          qb.where('tp.title', 'ilike', `%${params.title}%`);
        }
        if (params.tour_type) {
          qb.where('tp.tour_type', 'ilike', `%${params.tour_type}%`);
        }
        if (params.from_date && params.to_date) {
          const fromDate = new Date(params.from_date).toISOString();

          // Create a Date object for to_date and add 1 day
          const toDate = new Date(params.to_date);
          toDate.setDate(toDate.getDate() + 1); // Add one day

          // Set the new date to the beginning of the day (00:00:00.000)
          toDate.setUTCHours(0, 0, 0, 0);


          qb.whereBetween('tp.valid_till_date', [
            fromDate,
            toDate.toISOString(),
          ]);
        }
      })
      .andWhere('tp.is_deleted', false)
      .limit(params.limit ? params.limit : 100)
      .offset(params.skip ? params.skip : 0);

    return {
      data: data,
      total: total[0].total,
    };
  }

  //package list v2
  public async getTourPackageListV2(params: tourPackageFilterQuery) {
    const data = await this.db('tour_package as tp')
      .withSchema(this.SERVICE_SCHEMA)
      .select(
        'tp.id',
        'tp.title',
        'tp.type',
        'tp.tour_type',
        'tp.duration',
        'tp.details',
        'tp.valid_till_date',
        'tp.created_at',
        'tp.b2b_adult_price',
        'tp.b2c_adult_price',
        'tp.b2c_adult_price',
        'tp.b2c_child_price',
        'tp.b2b_child_price',
        'tp.b2b_discount',
        'tp.b2c_discount',
        'tp.b2b_discount_type',
        'tp.b2c_discount_type',
        'tp.status',
        'tp.group_size',
        'c.name as city_name',
        'cnt.name as country_name',
        'tpp.photo'
      )
      .joinRaw('LEFT JOIN public.city AS c ON tp.city_id = c.id')
      .joinRaw('LEFT JOIN public.country AS cnt ON c.country_id = cnt.id')
      .leftJoin(
        this.db
          .select('tpp.tour_id', 'tpp.photo')
          .from('services.tour_package_photos as tpp')
          .distinctOn('tpp.tour_id')
          .orderBy('tpp.tour_id', 'asc')
          .as('tpp'),
        'tpp.tour_id',
        'tp.id'
      )
      .where((qb) => {
        if (params.type) {
          qb.where('tp.type', params.type);
        }
        if (params.s_type) {
          qb.andWhere((innerQuery) => {
            innerQuery.orWhere('tp.type', params.s_type);
            innerQuery.orWhere('tp.type', 'both');
          });
        }
        if (params.country_id) {
          qb.where('cnt.id', params.country_id);
        }
        if (params.duration) {
          qb.andWhere('tp.duration',"<=", params.duration);
        }
        if (params.place) {
          qb.andWhere(function () {
            this.where('c.name', 'ilike', `%${params.place}%`).orWhere(
              'cnt.name',
              'ilike',
              `%${params.place}%`
            );
          });
        }
        if (params.date) {
          qb.andWhere('tp.valid_till_date', '>=', params.date);
        }

        if (params.from_date) {
          qb.andWhere('tp.valid_till_date', '>=', params.from_date);
        }

        if (params.to_date) {
          qb.andWhere('tp.valid_till_date', '<=', params.to_date);
        }

        if (params.country_id) {
          qb.andWhere('cnt.id', params.country_id);
        }
        if (params.title) {
          qb.andWhere('tp.title', 'ilike', `%${params.title}%`);
        }
        if (params.tour_type) {
          qb.andWhere('tp.tour_type', 'ilike', `${params.tour_type}`);
        }
        if (params.b2b_price_from_range && params.b2b_price_to_range) {
          qb.andWhereBetween('tp.b2b_adult_price', [
            params.b2b_price_from_range,
            params.b2b_price_to_range,
          ]);
        }
        if (params.b2c_price_from_range && params.b2c_price_to_range) {
          qb.andWhereBetween('tp.b2c_adult_price', [
            params.b2c_price_from_range,
            params.b2c_price_to_range,
          ]);
        }
      })
      .andWhere('tp.is_deleted', false)
      .andWhere('tp.status', true)
      .orderBy('tp.id', 'desc')
      .limit(params.limit ? params.limit : 100)
      .offset(params.skip ? params.skip : 0);

    const total = await this.db('tour_package as tp')
      .withSchema(this.SERVICE_SCHEMA)
      .count('tp.id as total')
      .joinRaw('LEFT JOIN public.city AS c ON tp.city_id = c.id')
      .joinRaw('LEFT JOIN public.country AS cnt ON c.country_id = cnt.id')
      .where((qb) => {
        if (params.status) {
          qb.where('tp.status', params.status);
        }
        if (params.type) {
          qb.where('tp.type', params.type);
        }
        if (params.s_type) {
          qb.andWhere((innerQuery) => {
            innerQuery.orWhere('tp.type', params.s_type);
            innerQuery.orWhere('tp.type', 'both');
          });
        }
        if (params.duration) {
          qb.andWhere('tp.duration', params.duration);
        }

        if (params.from_date) {
          qb.andWhere('tp.valid_till_date', '>=', params.from_date);
        }

        if (params.to_date) {
          qb.andWhere('tp.valid_till_date', '<=', params.to_date);
        }

        if (params.country_id) {
          qb.andWhere('cnt.id', params.country_id);
        }
        if (params.place) {
          qb.andWhere(function () {
            this.where('c.name', 'ilike', `%${params.place}%`).orWhere(
              'cnt.name',
              'ilike',
              `%${params.place}%`
            );
          });
        }
        if (params.date) {
          qb.andWhere('tp.valid_till_date', '>=', params.date);
        }
        if (params.title) {
          qb.andWhere('tp.title', 'ilike', `%${params.title}%`);
        }
        if (params.tour_type) {
          qb.andWhere('tp.tour_type', 'ilike', `${params.tour_type}`);
        }
        if (params.b2b_price_from_range && params.b2b_price_to_range) {
          qb.andWhereBetween('tp.b2b_adult_price', [
            params.b2b_price_from_range,
            params.b2b_price_to_range,
          ]);
        }
        if (params.b2c_price_from_range && params.b2c_price_to_range) {
          qb.andWhereBetween('tp.b2c_adult_price', [
            params.b2c_price_from_range,
            params.b2c_price_to_range,
          ]);
        }
      })
      .andWhere('tp.is_deleted', false)
      .andWhere('tp.status', true);

    return {
      data: data,
      total: total[0].total,
    };
  }

  //get review
  public async getReview(id: number) {
    const review = await this.db('tour_package_review')
      .withSchema(this.SERVICE_SCHEMA)
      .where({ tour_id: id })
      .select(
        this.db.raw('COUNT(*) as count'),
        this.db.raw('AVG(rating) as average')
      )
      .first();

    return {
      count: review ? Number(review.count) : 0,
      average: review ? Number(review.average).toFixed(2) : 0,
    };
  }

  // get all reveies
  public async getAllTourPackesReview(params: ITourPackageReviewParams) {
    const data = this.db('tour_package_review_with_photos as tpr')
      .withSchema(this.SERVICE_SCHEMA)
      .select('*')
      .where((qb) => {
        if (params.tour_id) {
          qb.andWhere('tpr.tour_id', params.tour_id);
        }
      })
      .orderBy(
        params.order_by ? params.order_by : 'tpr.rating',
        params.order_to ? params.order_to : 'desc'
      );

    if (params.limit) {
      data.limit(params.limit);
    }
    if (params.skip) {
      data.offset(params.skip);
    }

    const total = await this.db('tour_package_review_with_photos as tpr')
      .withSchema(this.SERVICE_SCHEMA)
      .count('tpr.review_id as total')
      .where((qb) => {
        if (params.tour_id) {
          qb.andWhere('tpr.tour_id', params.tour_id);
        }
      });

    return {
      data: await data,
      total: total[0].total,
    };
  }

  public async singleTourPackesReview(params: ITourPackageReviewParams) {
    const data = await this.db('tour_package_review_with_photos as tpr')
      .withSchema(this.SERVICE_SCHEMA)
      .select('*')
      .where((qb) => {
        qb.andWhere('tpr.review_id', params.id);
      });

    return {
      data: data,
    };
  }

  // create tour package review
  public async createTourPackageReview(payload: ITourPackageReviewPayload) {
    return await this.db('tour_package_review')
      .withSchema(this.SERVICE_SCHEMA)
      .insert(payload, 'id');
  }

  public async createTourPackageReviewPhoto(
    payload: ITourPackageReviewPhotoPayload | ITourPackageReviewPhotoPayload[]
  ) {
    return await this.db('tour_package_review_photos')
      .withSchema(this.SERVICE_SCHEMA)
      .insert(payload, 'id');
  }

  // //get single tour package
  // public async getSingleTourPackage(id: Number) {
  //   return await this.db('tour_package_details_view')
  //     .withSchema(this.SERVICE_SCHEMA)
  //     .where({ id })
  //     .andWhere({ is_deleted: false })
  //     .select('*')
  //     .first();
  // }

  //get single tour package
  public async deleteTourPackage(id: Number) {
    return await this.db('tour_package')
      .withSchema(this.SERVICE_SCHEMA)
      .update({ is_deleted: true })
      .where({ id });
  }

  //delete itinerary photo
  public async deleteItineraryPhoto(id: Number) {
    return await this.db('tour_package_itinerary')
      .withSchema(this.SERVICE_SCHEMA)
      .where({ id })
      .delete();
  }
  //delete tour photo
  public async deleteTourPhoto(id: Number) {
    return await this.db('tour_package_photos')
      .withSchema(this.SERVICE_SCHEMA)
      .where({ id })
      .delete();
  }
  //delete include exclude
  public async deleteIncludeExclude(id: Number) {
    return await this.db('tour_package_include_exclude')
      .withSchema(this.SERVICE_SCHEMA)
      .where({ id })
      .delete();
  }

  //get single tour package
  public async getSingleTourPackage(id: number) {
    return await this.db('tour_package as tp')
      .withSchema(this.SERVICE_SCHEMA)
      .select('tp.*', 'c.name as city_name', 'cnt.name as country_name')
      .joinRaw('LEFT JOIN public.city AS c ON tp.city_id = c.id')
      .joinRaw('LEFT JOIN public.country AS cnt ON c.country_id = cnt.id')
      .where('tp.id', id);
  }

  //get photos of tour
  public async getTourPhotos(id: number) {
    return await this.db('tour_package_photos')
      .withSchema(this.SERVICE_SCHEMA)
      .select('id', 'photo')
      .where('tour_id', id);
  }

  //get services of tour
  public async getTourServices(id: number, type?: string) {
    return await this.db('tour_package_services')
      .withSchema(this.SERVICE_SCHEMA)
      .select('id', 'title')
      .where('tour_id', id)
      .andWhere((qb) => {
        if (type) {
          qb.andWhere('type', type);
        }
      });
  }

  //update tour service
  public async updateTourService(id: number, title: string) {
    return await this.db('tour_package_services')
      .withSchema(this.SERVICE_SCHEMA)
      .update({ title })
      .where({ id });
  }

  //delete tour service
  public async deleteTourService(id: number) {
    return await this.db('tour_package_services')
      .withSchema(this.SERVICE_SCHEMA)
      .delete()
      .where({ id });
  }

  //delete tour photos
  public async deleteTourPhotos(id: number) {
    return await this.db('tour_package_photos')
      .withSchema(this.SERVICE_SCHEMA)
      .delete()
      .where({ id });
  }

  public async createTourPackageRequest(payload: ITourPackageRequestPayload) {
    return await this.db('tour_package_request')
      .withSchema(this.SERVICE_SCHEMA)
      .insert(payload)
      .returning('id');
  }

  // public async getTourPackageRequest(params: tourPackageFilterQuery) {
  //   const data = await this.db("tour_package as tp")
  //     .withSchema(this.SERVICE_SCHEMA)
  //     .select(
  //       "tp.id",
  //       "tp.title",
  //       "tp.tour_type",
  //       "tp.duration",
  //       "tp.details",
  //       "tp.valid_till_date",
  //       "tp.created_at",
  //       "tp.b2b_adult_price",
  //       "tp.b2c_adult_price",
  //       "tp.b2c_adult_price",
  //       "tp.b2c_child_price",
  //       "tp.b2b_child_price",
  //       "tp.b2b_discount",
  //       "tp.b2c_discount",
  //       "tp.b2b_discount_type",
  //       "tp.b2c_discount_type",
  //       "tp.status",
  //       "c.name as city_name",
  //       "cnt.name as country_name",
  //       "tpp.photo"
  //     )
  //     .joinRaw("LEFT JOIN public.city AS c ON tp.city_id = c.id")
  //     .joinRaw("LEFT JOIN public.country AS cnt ON c.country_id = cnt.id")
  //     .leftJoin(
  //       this.db
  //         .select("tpp.tour_id", "tpp.photo")
  //         .from("services.tour_package_photos as tpp")
  //         .distinctOn("tpp.tour_id")
  //         .orderBy("tpp.tour_id", "asc")
  //         .as("tpp"),
  //       "tpp.tour_id",
  //       "tp.id"
  //     )
  //     .where((qb) => {
  //       if (params.status) {
  //         qb.where("tp.status", params.status);
  //       }
  //       if (params.duration) {
  //         qb.andWhere("tp.duration", params.duration);
  //       }
  //       if (params.place) {
  //         qb.andWhere(function () {
  //           this.where("c.name", "ilike", `%${params.place}%`).orWhere(
  //             "cnt.name",
  //             "ilike",
  //             `%${params.place}%`
  //           );
  //         });
  //       }
  //       if (params.date) {
  //         qb.andWhere("tp.valid_till_date", ">=", params.date);
  //       }
  //       if (params.title) {
  //         qb.andWhere("tp.title", "ilike", `%${params.title}%`);
  //       }
  //       if (params.tour_type) {
  //         qb.andWhere("tp.tour_type", "ilike", `${params.tour_type}`);
  //       }
  //       if (params.b2b_price_from_range && params.b2b_price_to_range) {
  //         qb.andWhereBetween("tp.b2b_adult_price", [
  //           params.b2b_price_from_range,
  //           params.b2b_price_to_range,
  //         ]);
  //       }
  //       if (params.b2c_price_from_range && params.b2c_price_to_range) {
  //         qb.andWhereBetween("tp.b2c_adult_price", [
  //           params.b2c_price_from_range,
  //           params.b2c_price_to_range,
  //         ]);
  //       }
  //     })
  //     .andWhere("tp.is_deleted", false)
  //     .orderBy("tp.id", "desc")
  //     .limit(params.limit ? params.limit : 100)
  //     .offset(params.skip ? params.skip : 0);

  //   const total = await this.db("tour_package as tp")
  //     .withSchema(this.SERVICE_SCHEMA)
  //     .count("tp.id as total")
  //     .joinRaw("LEFT JOIN public.city AS c ON tp.city_id = c.id")
  //     .joinRaw("LEFT JOIN public.country AS cnt ON c.country_id = cnt.id")
  //     .where((qb) => {
  //       if (params.status) {
  //         qb.where("tp.status", params.status);
  //       }
  //       if (params.duration) {
  //         qb.andWhere("tp.duration", params.duration);
  //       }
  //       if (params.place) {
  //         qb.andWhere(function () {
  //           this.where("c.name", "ilike", `%${params.place}%`).orWhere(
  //             "cnt.name",
  //             "ilike",
  //             `%${params.place}%`
  //           );
  //         });
  //       }
  //       if (params.date) {
  //         qb.andWhere("tp.valid_till_date", ">=", params.date);
  //       }
  //       if (params.title) {
  //         qb.andWhere("tp.title", "ilike", `%${params.title}%`);
  //       }
  //       if (params.tour_type) {
  //         qb.andWhere("tp.tour_type", "ilike", `${params.tour_type}`);
  //       }
  //       if (params.b2b_price_from_range && params.b2b_price_to_range) {
  //         qb.andWhereBetween("tp.b2b_adult_price", [
  //           params.b2b_price_from_range,
  //           params.b2b_price_to_range,
  //         ]);
  //       }
  //       if (params.b2c_price_from_range && params.b2c_price_to_range) {
  //         qb.andWhereBetween("tp.b2c_adult_price", [
  //           params.b2c_price_from_range,
  //           params.b2c_price_to_range,
  //         ]);
  //       }
  //     })
  //     .andWhere("tp.is_deleted", false);

  //   return {
  //     data: data,
  //     total: total[0].total,
  //   };
  // }

  //  get all tour packagte request

  public async getTourPackageRequests(params: ITourPackageRequestParams) {
    const data = this.db('tour_package_request as tpr')
      .withSchema(this.SERVICE_SCHEMA)
      .select(
        'tpr.id',
        'tpr.tour_package_id',
        'tpr.request_city_id',
        'tpr.request_date',
        this.db.raw(
          "concat(tpr.user_first_name, ' ', tpr.user_last_name) as user_name"
        ),
        'tpr.user_email',
        'tpr.user_phone',
        'tpr.status',
        'tpr.requirements',
        'tpr.created_at',
        'c.name as city_name',
        'c.id as request_city_id',
        'cnt.id as country_id',
        'cnt.name as country_name'
      )
      .joinRaw('LEFT JOIN public.city AS c ON tpr.request_city_id = c.id')
      .joinRaw('LEFT JOIN public.country AS cnt ON c.country_id = cnt.id')
      .where((qb) => {
        if (params.start_date && params.end_date) {
          qb.andWhereRaw('DATE(tpr.request_date) BETWEEN ? AND ?', [
            params.start_date,
            params.end_date,
          ]);
        }
        if (params.tour_package_id) {
          qb.andWhere('tpr.tour_package_id', params.tour_package_id);
        }
        if (params.user_email) {
          qb.andWhere('tpr.user_email', params.user_email);
        }
      })
      .orderBy('tpr.id', 'desc');

    if (params.limit) {
      data.limit(params.limit);
    }

    if (params.skip) {
      data.offset(params.skip);
    }

    const total = await this.db('tour_package_request as tpr')
      .withSchema(this.SERVICE_SCHEMA)
      .count('tpr.id as total')
      .joinRaw('LEFT JOIN public.city AS c ON tpr.request_city_id = c.id')
      .joinRaw('LEFT JOIN public.country AS cnt ON c.country_id = cnt.id')
      .where((qb) => {
        if (params.start_date && params.end_date) {
          qb.andWhereRaw('DATE(tpr.request_date) BETWEEN ? AND ?', [
            params.start_date,
            params.end_date,
          ]);
        }
        if (params.tour_package_id) {
          qb.andWhere('tpr.tour_package_id', params.tour_package_id);
        }
        if (params.user_email) {
          qb.andWhere('tpr.user_email', params.user_email);
        }
      });

    return {
      data: await data,
      total: total[0].total,
    };
  }

  // get single tour packager request
  public async singleTourPackageRequest(params: { id?: number }) {
    return this.db('tour_package_request as tpr')
      .withSchema(this.SERVICE_SCHEMA)
      .select(
        'tpr.id',
        'tpr.tour_package_id',
        'tpr.request_city_id',
        'tpr.request_date',
        this.db.raw(
          "concat(tpr.user_first_name, ' ', tpr.user_last_name) as user_name"
        ),
        'tpr.user_email',
        'tpr.user_phone',
        'tpr.status',
        'tpr.requirements',
        'tpr.created_at',
        'c.name as city_name',
        'c.id as request_city_id',
        'cnt.id as country_id',
        'cnt.name as country_name'
      )
      .joinRaw('LEFT JOIN public.city AS c ON tpr.request_city_id = c.id')
      .joinRaw('LEFT JOIN public.country AS cnt ON c.country_id = cnt.id')
      .where((qb) => {
        if (params.id) {
          qb.andWhere('tpr.id', params.id);
        }
      });
  }

  //  update Tour Package Request
  public async updateTourPackageRequest(
    query: { id?: number },
    payload: Partial<IInsertBookingRequestPayload>
  ) {
    return await this.db('tour_package_request')
      .withSchema(this.SERVICE_SCHEMA)
      .update(payload, 'id')
      .where({ id: query.id });
  }

  //get city name
  public async getCityName() {
    return await this.db('tour_package')
      .withSchema('services')
      .select('tour_package.city_id', 'city.name', 'code')
      .joinRaw('JOIN public.city ON services.tour_package.city_id = public.city.id')
      .distinct();
  }

  //get country name
  public async getCountryName() {
    return await this.db('tour_package')
      .withSchema('services')
      .select("cnt.id",'cnt.name')
      .joinRaw('JOIN public.city as c ON services.tour_package.city_id = c.id')
      .joinRaw('JOIN public.country as cnt ON c.country_id = cnt.id')
      // .groupBy('cnt.id','cnt.name')
      .distinct();
  }
}
