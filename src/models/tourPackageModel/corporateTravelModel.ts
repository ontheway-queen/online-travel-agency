import { TDB } from '../../features/public/utils/types/commonTypes';
import Schema from '../../utils/miscellaneous/schema';

export class CorporateTravelModel extends Schema {
  private db: TDB;
  constructor(db: TDB) {
    super();
    this.db = db;
  }

  //insert Banner Image
  public async insertBannerImage(image_url: string) {
    return await this.db('corporate_travel_banner')
      .withSchema('services')
      .insert({ image: image_url });
  }

  //insert Tour info
  public async insertTourinfo(payload: { tour_id: number; tour_type: string }) {
    return await this.db('tour_package_list')
      .withSchema('services')
      .insert({ tour_id: payload.tour_id, tour_type: payload.tour_type });
  }

  //insert video url
  public async insertVideo(obj: { video_url: string }) {
    return await this.db('corporate_travel_video')
      .withSchema('services')
      .insert({ video_url: obj.video_url });
  }

  // get all data for corporate travel page
  public async getDataForCorporatePackagePage() {
    const tourPackages = await this.db('tour_package_list')
      .withSchema('services')
      .select(
        'tour_package_list.id',
        'tour_package.title',
        'city.name as city_name',
        'tour_package.duration',
        'tour_package_list.tour_type',
        'tour_package.b2c_adult_price',

        this.db.raw(`
          json_agg(
            json_build_object(
              'id', tour_package_photos.id,
              'file', tour_package_photos.photo
            )
          ) as file
        `)
      )
      .joinRaw(
        'JOIN services.tour_package ON tour_package_list.tour_id=tour_package.id'
      )
      .joinRaw(
        'LEFT JOIN services.tour_package_photos ON tour_package_list.tour_id = tour_package_photos.tour_id'
      )
      .joinRaw('JOIN public.city ON tour_package.city_id = city.id')
      .groupBy('tour_package_list.id', 'tour_package.id', 'city.name')
      .where('tour_package_list.status', true)
      .orderBy('id', 'desc');

    const banner_imgs = await this.db('corporate_travel_banner')
      .withSchema('services')
      .select('id', 'image as file')
      .where('status', true)
      .orderBy('id', 'desc');
    const videos = await this.db('corporate_travel_video')
      .withSchema('services')
      .select('id', 'video_url as url')
      .where('status', true)
      .orderBy('id', 'desc');

    return { tourPackages, banner_imgs, videos };
  }

  // update Package list
  public async updatePackageList(payload: { id: number; status?: boolean }) {
    return await this.db('tour_package_list')
      .withSchema('services')
      .update({ status: payload.status })
      .where('id', payload.id);
  }

  // update banner Image list
  public async updateBannerImageList(payload: {
    id: number;
    status?: boolean;
  }) {
    return await this.db('corporate_travel_banner')
      .withSchema('services')
      .update({ status: payload.status })
      .where('id', payload.id);
  }

  // update video list
  public async updateVideoList(payload: { id: number; status?: boolean }) {
    return await this.db('corporate_travel_video')
      .withSchema('services')
      .update({ status: payload.status })
      .where('id', payload.id);
  }
}
