import { TDB } from '../../features/public/utils/types/commonTypes';
import {
  IUmrahDetailDescriptionPayload,
  IUmrahpackagePayload,
  IUmrahPackagePhotosPayload,
} from '../../utils/interfaces/admin/umrahPackageInterface';
import Schema from '../../utils/miscellaneous/schema';

export class UmrahPackageModel extends Schema {
  private db: TDB;
  constructor(db: TDB) {
    super();
    this.db = db;
  }

  // Create Umrah Package
  public async createUmrahPackage(payload: IUmrahpackagePayload) {
    return await this.db<IUmrahpackagePayload>('umrah_package')
      .withSchema('services')
      .insert(payload)
      .returning('id');
  }

  //insert package include exclude
  public async insertPackageIncludeExclude(payload: {
    include_exclude_id: number;
    umrah_id: number;
  }) {
    return await this.db('umrah_package_include')
      .withSchema('services')
      .insert(payload);
  }

  // Create Umrah Package Details
  public async createUmrahPackageDetails(payload: {
    umrah_id: number;
    details_title: string;
    details_description: string;
    status?: boolean;
    type: string;
  }) {
    // console.log('payload', payload);
    return await this.db('umrah_package_details')
      .withSchema('services')
      .insert(payload)
      .returning('id');
  }

  // Get All the umrah package from admin
  public async getAllUmrahPackage(params: {
    limit: number;
    title: string;
    offset: number;
    to_date: Date;
    status: boolean;
    is_deleted: boolean;
  }) {
    const umrahPackage = await this.db<IUmrahpackagePayload>('umrah_package')
      .withSchema('services')
      .select(
        'id',
        'package_name',
        'duration',
        'is_featured',
        'valid_till_date',
        'group_size',
        'total_accommodation',
        'total_destination',
        'b2b_price_per_person',
        'b2b_discount',
        'b2c_price_per_person',
        'b2c_discount',
        'status',
        'b2b_discount_type',
        'b2c_discount_type'
      )
      .where((qb) => {
        if (params.to_date) {
          qb.andWhere('valid_till_date', '<=', params.to_date);
        }
      })
      .andWhere((qb) => {
        if (params.status !== undefined) {
          qb.where('status', '=', params.status);
        }
      })
      .andWhere((qb) => {
        if (params.is_deleted !== undefined) {
          qb.where('is_deleted', '=', params.is_deleted);
        }
      })
      .andWhere((qb) => {
        if (params.title) {
          qb.whereILike('package_name', `%${params.title}%`);
        }
      })
      .limit(params.limit)
      .offset(params.offset)
      .orderBy('id', 'desc');

    const umrahPackageCount: any = await this.db<IUmrahpackagePayload>(
      'umrah_package'
    )
      .withSchema('services')
      .select(this.db.raw('COUNT(id) as total'))
      .where((qb) => {
        if (params.to_date) {
          qb.andWhere('valid_till_date', '<=', params.to_date);
        }
      })
      .andWhere((qb) => {
        if (params.status !== undefined) {
          qb.where('status', '=', params.status);
        }
      })
      .andWhere((qb) => {
        if (params.is_deleted !== undefined) {
          qb.where('is_deleted', '=', params.is_deleted);
        }
      })
      .andWhere((qb) => {
        if (params.title) {
          qb.whereILike('package_name', `%${params.title}%`);
        }
      });

    // Access the total count
    // console.log(umrahPackageCount[0].total);

    // console.log(umrahPackageCount);

    return { umrahPackage, umrahPackageCount };
  }

  public async getIncludeExcludeItems() {
    return await this.db('umrah_include_exclude_items')
      .withSchema('services')
      .select('*');
  }

  // Upload Umrah Package Image
  public async uplaodUmrahPackageImage(payload: IUmrahPackagePhotosPayload) {
    return await this.db<IUmrahPackagePhotosPayload>('umrah_package_photos')
      .withSchema('services')
      .insert(payload);
  }

  // Get Single Umrah Package for admin
  public async getSingleUmrahPackage(id?: number, slug?: string) {
    const singlePackage: any = await this.db('umrah_package as up')
      .withSchema('services')
      .select(
        'up.*',
        this.db.raw(`(
        SELECT json_agg(
          json_build_object(
            'id', upp.id,
            'photo', upp.photo
          )
        ) 
        FROM services.umrah_package_photos as upp
        WHERE upp.umrah_id = up.id
      ) as images`),

        this.db.raw(`(
        SELECT json_agg(detail)
        FROM (
          SELECT json_build_object(
            'id', upd.id,
            'umrah_id', upd.umrah_id,
            'details_title', upd.details_title,
            'details_description', upd.details_description,
            'type', upd.type,
            'status', upd.status
          ) AS detail
          FROM services.umrah_package_details as upd
          WHERE upd.umrah_id = up.id 
          ORDER BY upd.id
        ) AS ordered_details
      ) as package_details`),

        this.db.raw(`(
        SELECT json_agg(
          json_build_object(
            'index' , upei.id,
            'id', uiei.id
          )
        )
        FROM services.umrah_package_include as upei
        JOIN services.umrah_include_exclude_items as uiei 
          ON upei.include_exclude_id = uiei.id
        WHERE upei.umrah_id = up.id
      ) AS include`)
      )
      .where((qb) => {
        if (id) {
          qb.andWhere('up.id', id);
        }
        if (slug) {
          qb.andWhere('up.slug', slug);
        }
      })
      .first();

    return singlePackage;
  }

  public async getSlugCheck(id: number, slug: string) {
    return await this.db('umrah_package')
      .withSchema('services')
      .whereNot('id', id)
      .andWhere('slug', slug);
  }

  // Update Umrah Package
  public async updateUmrahPackage(payload: IUmrahpackagePayload, id: number) {
    return await this.db<IUmrahpackagePayload>('umrah_package')
      .withSchema('services')
      .where({ id: id })
      .update(payload);
  }

  //update umrah package details
  public async updateUmrahPackageDetails(
    payload: {
      umrah_id: number;
      details_title: string;
      details_description: string;
      status: boolean;
    },
    id: number
  ) {
    // console.log({ payload });
    return await this.db('umrah_package_details')
      .withSchema('services')
      .update(payload)
      .where('id', id);
  }

  //delete package include exclude
  public async deleteIncludeExclude(id: number) {
    return await this.db('umrah_package_include')
      .withSchema('services')
      .where('id', id)
      .del();
  }

  //Delete Umrah Package Image
  public async deleteUmrahPackageImage(id: number) {
    return await this.db('umrah_package_photos')
      .withSchema('services')
      .where('id', id)
      .del();
  }

  //delete umrah package details
  public async deleteUmrahPackageDetails(id: number) {
    return await this.db('umrah_package_details')
      .withSchema('services')
      .where('id', id)
      .del();
  }

  //Get All Umrah Package For B2C
  public async getAllUmrahPackageForB2C(params: {
    to_date: Date;
    duration: number;
    min_price: number;
    max_price: number;
  }) {
    const allUmrahPackage = await this.db<IUmrahpackagePayload>('umrah_package')
      .withSchema('services')
      .select(
        'id',
        'package_name',
        'duration',
        'valid_till_date',
        'group_size',
        'b2c_price_per_person',
        'b2c_discount',
        'b2c_discount_type',
        'slug'
      )
      .where((qb) => {
        if (params.to_date) {
          qb.whereRaw(`DATE(valid_till_date) <= DATE(?)`, [params.to_date]);
        }
      })
      .andWhere((qb) => {
        if (params.duration) {
          qb.where('duration', '<=', params.duration);
        }
      })
      .andWhere('status', true)
      .andWhere((qb) => {
        if (params.min_price && params.max_price) {
          qb.andWhereBetween('b2c_adult_price', [
            params.min_price,
            params.max_price,
          ]);
        }
      }).orderBy("id",'desc')


      const umrahPackageCount = await this.db<IUmrahpackagePayload>('umrah_package')
      .withSchema('services')
      .count('id')
      .where((qb) => {
        if (params.to_date) {
          qb.whereRaw(`DATE(valid_till_date) <= DATE(?)`, [params.to_date]);
        }
      })
      .andWhere((qb) => {
        if (params.duration) {
          qb.where('duration', '<=', params.duration);
        }
      })
      .andWhere('status', true)
      .andWhere((qb) => {
        if (params.min_price && params.max_price) {
          qb.andWhereBetween('b2c_adult_price', [
            params.min_price,
            params.max_price,
          ]);
        }
      });

    const umrahPackageWithImage = await Promise.all(
      allUmrahPackage.map(async (umrahPackage) => {
        const images = await this.db('umrah_package_photos')
          .withSchema('services')
          .select('id', 'photo')
          .where({ umrah_id: umrahPackage.id });
        return { ...umrahPackage, images };
      })
    );

    return {umrahPackageWithImage, umrahPackageCount};
  }


  public async getAllUmrahPackageForB2B(params: {
    to_date: Date;
    duration: number;
    min_price: number;
    max_price: number;
  }) {
    const allUmrahPackage = await this.db<IUmrahpackagePayload>('umrah_package')
      .withSchema('services')
      .select(
        'id',
        'package_name',
        'duration',
        'valid_till_date',
        'group_size',
        'b2c_price_per_person',
        'b2c_discount',
        'b2c_discount_type',
        'slug'
      )
      .where((qb) => {
        if (params.to_date) {
          qb.whereRaw(`DATE(valid_till_date) <= DATE(?)`, [params.to_date]);
        }
      })
      .andWhere((qb) => {
        if (params.duration) {
          qb.where('duration', '<=', params.duration);
        }
      })
      .andWhere('status', true)
      .andWhere((qb) => {
        if (params.min_price && params.max_price) {
          qb.andWhereBetween('b2c_adult_price', [
            params.min_price,
            params.max_price,
          ]);
        }
      }).orderBy("id",'desc')


      const umrahPackageCount = await this.db<IUmrahpackagePayload>('umrah_package')
      .withSchema('services')
      .count('id')
      .where((qb) => {
        if (params.to_date) {
          qb.whereRaw(`DATE(valid_till_date) <= DATE(?)`, [params.to_date]);
        }
      })
      .andWhere((qb) => {
        if (params.duration) {
          qb.where('duration', '<=', params.duration);
        }
      })
      .andWhere('status', true)
      .andWhere((qb) => {
        if (params.min_price && params.max_price) {
          qb.andWhereBetween('b2c_adult_price', [
            params.min_price,
            params.max_price,
          ]);
        }
      });

    const umrahPackageWithImage = await Promise.all(
      allUmrahPackage.map(async (umrahPackage) => {
        const images = await this.db('umrah_package_photos')
          .withSchema('services')
          .select('id', 'photo')
          .where({ umrah_id: umrahPackage.id });
        return { ...umrahPackage, images };
      })
    );

    return {umrahPackageWithImage, umrahPackageCount};
  }

  //Get Single Umrah Package
  public async getSingleUmrahPackageForB2C(slug: string) {
    const singlePackage: any = await this.db('umrah_package as up')
      .withSchema('services')
      .select(
        'up.id',
        'up.package_name',
        'up.slug',
        'up.description',
        'up.duration',
        'up.valid_till_date',
        'up.group_size',
        'up.b2c_price_per_person',
        'up.b2c_discount',
        'up.b2c_discount_type',
        'up.journey_start_date',
        'up.journey_end_date',
        'up.itinerary',
        'up.total_accommodation',
        'up.total_destination',
        'up.meeting_point',

        this.db.raw(`(
        SELECT json_agg(
          json_build_object(
            'id', upp.id,
            'photo', upp.photo
          )
        ) 
        FROM services.umrah_package_photos as upp
        WHERE upp.umrah_id = up.id
      ) as images`),

        this.db.raw(`(
        SELECT json_agg(
          json_build_object(
            'id', upd.id,
            'title', upd.details_title,
            'description', upd.details_description
          )
        )
        FROM services.umrah_package_details as upd
        WHERE upd.umrah_id = up.id AND upd.status = true AND upd.type = 'price'
      ) as price_details`),

        this.db.raw(`(
        SELECT json_agg(
          json_build_object(
            'id', upd.id,
            'title', upd.details_title,
            'description', upd.details_description
          )
        )
        FROM services.umrah_package_details as upd
        WHERE upd.umrah_id = up.id AND upd.status = true AND upd.type = 'accommodation'
      ) as accommodation_details`),
        this.db.raw(`(
        SELECT json_agg(
          json_build_object(
            'id' , upei.id,
            'icon', uiei.icon,
            'title', uiei.title,
            'description', uiei.description
          )
        )
        FROM services.umrah_package_include as upei
        JOIN services.umrah_include_exclude_items as uiei 
          ON upei.include_exclude_id = uiei.id
        WHERE upei.umrah_id = up.id 
      ) AS include`)
      )
      .where('up.slug', slug)
      .andWhere('up.status', true)
      .first();

    return singlePackage;
  }


  public async getSingleUmrahPackageForB2B(id: number) {
    const singlePackage: any = await this.db('umrah_package as up')
      .withSchema('services')
      .select(
        'up.id',
        'up.package_name',
        'up.slug',
        'up.description',
        'up.duration',
        'up.valid_till_date',
        'up.group_size',
        'up.b2c_price_per_person',
        'up.b2c_discount',
        'up.b2c_discount_type',
        'up.journey_start_date',
        'up.journey_end_date',
        'up.itinerary',
        'up.total_accommodation',
        'up.total_destination',
        'up.meeting_point',

        this.db.raw(`(
        SELECT json_agg(
          json_build_object(
            'id', upp.id,
            'photo', upp.photo
          )
        ) 
        FROM services.umrah_package_photos as upp
        WHERE upp.umrah_id = up.id
      ) as images`),

        this.db.raw(`(
        SELECT json_agg(
          json_build_object(
            'id', upd.id,
            'title', upd.details_title,
            'description', upd.details_description
          )
        )
        FROM services.umrah_package_details as upd
        WHERE upd.umrah_id = up.id AND upd.status = true AND upd.type = 'price'
      ) as price_details`),

        this.db.raw(`(
        SELECT json_agg(
          json_build_object(
            'id', upd.id,
            'title', upd.details_title,
            'description', upd.details_description
          )
        )
        FROM services.umrah_package_details as upd
        WHERE upd.umrah_id = up.id AND upd.status = true AND upd.type = 'accommodation'
      ) as accommodation_details`),
        this.db.raw(`(
        SELECT json_agg(
          json_build_object(
            'id' , upei.id,
            'icon', uiei.icon,
            'title', uiei.title,
            'description', uiei.description
          )
        )
        FROM services.umrah_package_include as upei
        JOIN services.umrah_include_exclude_items as uiei 
          ON upei.include_exclude_id = uiei.id
        WHERE upei.umrah_id = up.id 
      ) AS include`)
      )
      .where('up.id', id)
      .andWhere('up.status', true)
      .first();

    return singlePackage;
  }

  //Get City Name
  public async getCityName() {
    return await this.db('umrah_package')
      .withSchema('services')
      .joinRaw('JOIN public.city ON services.umrah_package.city_id = public.city.id')
      .select('umrah_package.city_id', 'city.name', 'code')
      .distinct();
  }

  // create umrah package details description
  public async createDetailDescription(
    payload: IUmrahDetailDescriptionPayload
  ) {
    return await this.db('umrah_package_detail_description')
      .withSchema('services')
      .insert(payload)
      .onConflict('page')
      .merge();
  }

  // get umrah package details description
  public async getDetailDescription() {
    return await this.db<IUmrahDetailDescriptionPayload>(
      'umrah_package_detail_description'
    )
      .withSchema('services')
      .select(
        'title',
        'description',
        'meta_title',
        'meta_description',
        'cover_img',
        'status',
        'page'
      );
  }
}
