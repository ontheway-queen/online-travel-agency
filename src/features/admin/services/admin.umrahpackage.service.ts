import AbstractServices from "../../../abstract/abstract.service";
import { Request } from "express";

export class UmrahPackageService extends AbstractServices {
  constructor() {
    super();
  }

  // Create Umrah Package
  public async createUmrahPackage(req: Request) {
    return await this.db.transaction(async (trx) => {
      const model = this.Model.umrahPackageModel(trx);

      const files = (req.files as Express.Multer.File[]) || [];

      const { package_details, include, package_name, ...rest } = req.body;

      // check slug already exist or not
      const slug = package_name.toLowerCase().replace(/ /g, "-");

      const check_slug = await model.getSingleUmrahPackage(undefined, slug);

      if (check_slug) {
        return {
          success: false,
          code: this.StatusCode.HTTP_CONFLICT,
          message: this.ResMsg.SLUG_EXISTS,
        };
      }
      // create umrah package
      const createdPackage = await model.createUmrahPackage({
        ...rest,
        package_name,
        slug,
        created_by: req.admin.id,
      });

      const umrah_id = createdPackage[0]?.id;

      //add include exclude
      if (umrah_id && include) {
        const include_parse = JSON.parse(include);
        if (include_parse.length) {
          for (const item of include_parse) {
            await model.insertPackageIncludeExclude({
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

          await model.createUmrahPackageDetails({
            details_title,
            details_description,
            type,
            umrah_id: umrah_id,
          });
        }
      }

      // upload umrah image
      if (files?.length) {
        const length = files?.length;
        for (var i = 0; i < length; i++) {
          const photo = files[i]?.filename;
          const uploadedUmrahPackageImage = await model.uplaodUmrahPackageImage(
            {
              photo: photo,
              umrah_id: umrah_id,
            }
          );
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
    });
  }

  // Get All the umrah package from admin
  public async getAllUmrahPackage(req: Request) {
    const model = this.Model.umrahPackageModel();
    const { page, limit, title, to_date, status, is_deleted } =
      req.query as unknown as {
        page: number;
        limit: number;
        title: string;
        to_date: Date;
        status: boolean;
        is_deleted: false;
      };

    const offset = (page - 1) * limit;

    const getAllUmrahPackage = await model.getAllUmrahPackage({
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
  }

  // Get Single Umrah Package for admin
  public async getSingleUmrahPackage(req: Request) {
    const model = this.Model.umrahPackageModel();

    const { id } = req.params as unknown as { id: number };

    const singlePackage = await model.getSingleUmrahPackage(id);

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
  }

  // Update Umrah Package
  public async updateUmrahPackage(req: Request) {
    const model = this.Model.umrahPackageModel();

    const { id } = req.params as unknown as { id: number };
    const {
      remove_image,
      package_details,
      remove_include,
      include,
      package_name,
      ...rest
    } = req.body;

    const slug = package_name.toLowerCase().replace(/ /g, "-");
    const check_slug = await model.getSlugCheck(id, slug);

    if (check_slug.length) {
      return {
        success: false,
        code: this.StatusCode.HTTP_CONFLICT,
        message: this.ResMsg.SLUG_EXISTS,
      };
    }

    const umrahPackage: any = await model.getSingleUmrahPackage(id);

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
        const umrahInclude = umrahPackage?.include || [];
        const dbIds = umrahInclude.map((item: any) => item.id);
        const nonMatchingItems = includeItems.filter(
          (item: any) => !dbIds.includes(item)
        );

        await Promise.all(
          nonMatchingItems.map((item: any) =>
            model.insertPackageIncludeExclude({
              include_exclude_id: item,
              umrah_id: Number(umrahPackage.id),
            })
          )
        );
      }
    }

    // Delete includes
    if (remove_include) {
      const removeIncludeItems = JSON.parse(remove_include);
      await Promise.all(
        removeIncludeItems.map((includeId: any) =>
          model.deleteIncludeExclude(includeId)
        )
      );
    }

    // Delete package details if they don’t match current details

    if (Array.isArray(package_details)) {
      const umrahPackageDetails = umrahPackage?.package_details || [];
      const deleteDetailsPromises = umrahPackageDetails
        .filter(
          (detail: any) => !package_details.some((d: any) => d.id === detail.id)
        )
        .map((detail: any) => model.deleteUmrahPackageDetails(detail.id));

      await Promise.all(deleteDetailsPromises);

      // Update or create new package details
      await Promise.all(
        package_details.map(async (details: any) => {
          const { id, ...restDetails } = details;
          return id
            ? model.updateUmrahPackageDetails(restDetails, id)
            : model.createUmrahPackageDetails({
                umrah_id: umrahPackage.id,
                ...restDetails,
              });
        })
      );
    }

    // Remove images
    if (remove_image) {
      const imageIds = JSON.parse(remove_image);
      const filesToDelete = umrahPackage.images
        .filter((img: any) => imageIds.includes(img.id))
        .map((img: any) => img.photo);

      await this.manageFile.deleteFromCloud(filesToDelete);
      await Promise.all(
        imageIds.map((id: any) => model.deleteUmrahPackageImage(id))
      );
    }

    // Upload new images
    const files = (req.files as Express.Multer.File[]) || [];
    if (files.length) {
      await Promise.all(
        files.map((file) =>
          model.uplaodUmrahPackageImage({
            photo: file.filename,
            umrah_id: id,
          })
        )
      );
    }

    // Update umrah package
    await model.updateUmrahPackage({ package_name, slug, ...rest }, id);

    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
    };
  }

  //get include exclude item
  public async getIncludeExcludeItems(req: Request) {
    const model = this.Model.umrahPackageModel();

    const include_exclude = await model.getIncludeExcludeItems();
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: this.ResMsg.HTTP_OK,
      data: include_exclude,
    };
  }

  // create Details Description
  public async createDetailDescription(req: Request) {
    return await this.db.transaction(async (trx) => {
      const model = this.Model.umrahPackageModel(trx);
      const files = (req.files as Express.Multer.File[]) || [];

      const reqBody = {
        ...req.body,
      };
      if (files.length) {
        reqBody.cover_img = files[0].filename;
      }

      await model.createDetailDescription(reqBody);

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: this.ResMsg.HTTP_SUCCESSFUL,
      };
    });
  }
}
