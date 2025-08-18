import AbstractServices from '../../../abstract/abstract.service';
import { Request } from 'express';
import CustomError from '../../../utils/lib/customError';
import { ICreateSupplierAirlinesDynamicFarePayload } from '../../../utils/interfaces/dynamicFareRulesModelInterface/dynamicFareRulesModel.interface';

export class AdminDynamicFareRulesService extends AbstractServices {
  // ------------------ Dynamic Fare Set ------------------
  public async createSet(req: Request) {
    return await this.db.transaction(async (trx) => {
      const { name } = req.body;
      const { id: created_by } = req.admin;
      const model = this.Model.DynamicFareModel(trx);
      const check_duplicate = await model.getSets(name);
      if (check_duplicate.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_CONFLICT,
          message: 'Set already exists with this name',
        };
      }
      const res = await model.createSet({ name, created_by });
      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: 'Dynamic fare set has been created',
        data: { id: res[0]?.id },
      };
    });
  }

  public async getSets(req: Request) {
    const model = this.Model.DynamicFareModel();
    const data = await model.getSets();
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data,
    };
  }

  public async updateSet(req: Request) {
    const model = this.Model.DynamicFareModel();
    const { id } = req.params;
    const body = req.body;
    const existing = await model.getSetById(Number(id));
    if (!existing.length) {
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: this.ResMsg.HTTP_NOT_FOUND,
      };
    }
    const check_duplicate = await model.getSets(body.name);
    if (check_duplicate.length) {
      return {
        success: false,
        code: this.StatusCode.HTTP_CONFLICT,
        message: 'Set already exists with this name',
      };
    }
    await model.updateSet(Number(id), body);
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: 'Dynamic fare set updated',
    };
  }

  public async deleteSet(req: Request) {
    return await this.db.transaction(async (trx) => {
      const model = this.Model.DynamicFareModel(trx);
      const { id } = req.params;
      const existing = await model.getSetById(Number(id));
      if (!existing.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_NOT_FOUND,
          message: this.ResMsg.HTTP_NOT_FOUND,
        };
      }

      const agencyModel = this.Model.agencyModel(trx);
      const check_agency_set_usage = await agencyModel.checkAgency({
        commission_set_id: Number(id),
      });
      if (check_agency_set_usage.data.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_CONFLICT,
          message:
            'This set is already used for agencies. To continue update sets of the agencies.',
        };
      }

      const check_b2c_set_usage = await model.getB2CCommission();
      if (Number(check_b2c_set_usage?.[0]?.commission_set_id) === Number(id)) {
        return {
          success: false,
          code: this.StatusCode.HTTP_CONFLICT,
          message:
            'This set is already used for B2C. To continue update set for B2C.',
        };
      }

      await model.deleteSet(Number(id));
      return {
        success: true,
        code: this.StatusCode.HTTP_OK,
        message: 'Dynamic fare set deleted',
      };
    });
  }

  public async cloneSet(req: Request) {
    return await this.db.transaction(async (trx) => {
      const model = this.Model.DynamicFareModel(trx);
      const { id } = req.params;
      const existing = await model.getSetById(Number(id));
      if (!existing.length) {
        throw new CustomError(
          this.ResMsg.HTTP_NOT_FOUND,
          this.StatusCode.HTTP_NOT_FOUND
        );
      }

      const { name } = req.body;
      const { id: created_by } = req.admin;
      const check_duplicate = await model.getSets(name);
      if (check_duplicate.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_CONFLICT,
          message: 'Set already exists with this name',
        };
      }
      const res = await model.createSet({ name, created_by });

      //get supplier list
      const suppliers = await model.getSuppliers({ set_id: Number(id), order_by: 'asc' });
      if (suppliers.length) {
        //clone suppliers
        for (const supplier of suppliers) {
          const new_supplier = await model.createSupplier({
            set_id: res[0]?.id,
            supplier_id: supplier.supplier_id,
            commission: supplier.commission,
            commission_type: supplier.commission_type,
            markup: supplier.markup,
            markup_type: supplier.markup_type,
            status: supplier.status,
            segment_commission: supplier.segment_commission,
            segment_commission_type: supplier.segment_commission_type,
            segment_markup: supplier.segment_markup,
            segment_markup_type: supplier.segment_markup_type,
            pax_markup: supplier.pax_markup,
          });

          //clone supplier airlines fare
          const supplierAirlinesFares = await model.getSupplierAirlinesFares({
            dynamic_fare_supplier_id: supplier.id,
            order_by: 'asc',
          });

          if (supplierAirlinesFares.length) {
            for (const fare of supplierAirlinesFares) {
              await model.createSupplierAirlinesFare({
                dynamic_fare_supplier_id: new_supplier[0]?.id,
                airline: fare.airline,
                from_dac: fare.from_dac,
                to_dac: fare.to_dac,
                soto: fare.soto,
                domestic: fare.domestic,
                commission_type: fare.commission_type,
                commission: fare.commission,
                markup_type: fare.markup_type,
                markup: fare.markup,
                flight_class: fare.flight_class,
                segment_commission: fare.segment_commission,
                pax_markup: fare.pax_markup,
                segment_commission_type: fare.segment_commission_type,
                segment_markup: fare.segment_markup,
                segment_markup_type: fare.segment_markup_type,
                status: fare.status,
              });
            }
          }

          //clone preferred/blocked airlines
          const airlinePreferenceModel = this.Model.AirlinesPreferenceModel(trx);
          const preferredAirlines = await airlinePreferenceModel.getAirlinesPreferences({
            dynamic_fare_supplier_id: supplier.id,
            order_by: 'asc',
          });
          if (preferredAirlines.length) {
            for (const airline of preferredAirlines) {
              await airlinePreferenceModel.createAirlinePreference({
                dynamic_fare_supplier_id: new_supplier[0]?.id,
                airlines_code: airline.airlines_code,
                status: airline.status,
                preference_type: airline.preference_type,
                from_dac: airline.from_dac,
                to_dac: airline.to_dac,
                domestic: airline.domestic,
                soto: airline.soto,
              });
            }
          }

          //clone fare taxes
          const fareTaxes = await model.getFareTaxes({
            dynamic_fare_supplier_id: suppliers[0].id,
            order_by: 'asc'
          });
          if (fareTaxes.length) {
            for (const fareTax of fareTaxes) {
              await model.createFareTax({
                dynamic_fare_supplier_id: res[0]?.id,
                airline: fareTax.airline,
                tax_name: fareTax.tax_name,
                commission: fareTax.commission,
                commission_type: fareTax.commission_type,
                markup: fareTax.markup,
                markup_type: fareTax.markup_type,
                status: fareTax.status,
              });
            }
          }
        }
      }
      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: 'Dynamic fare has been cloned',
        data: { id: res[0]?.id },
      }

    });
  }

  // ------------------ Supplier List------------------

  public async getSupplierList(req: Request) {
    const model = this.Model.DynamicFareModel();
    const data = await model.getSupplierList();
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data,
    };
  }

  // ------------------ Dynamic Fare Supplier ------------------
  public async createSupplier(req: Request) {
    return await this.db.transaction(async (trx) => {
      const model = this.Model.DynamicFareModel(trx);
      const check_entry = await model.getSuppliers({
        set_id: req.body.set_id,
        supplier_id: req.body.supplier_id,
      });
      if (check_entry.length) {
        return {
          success: false,
          code: this.StatusCode.HTTP_CONFLICT,
          message: 'This supplier already exists for this set',
        };
      }
      const res = await model.createSupplier(req.body);
      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: 'Supplier created',
        data: { id: res[0]?.id },
      };
    });
  }

  public async getSuppliers(req: Request) {
    const { set_id } = req.query;
    const model = this.Model.DynamicFareModel();
    const data = await model.getSuppliers({ set_id: Number(set_id) });
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data,
    };
  }

  public async updateSupplier(req: Request) {
    const model = this.Model.DynamicFareModel();
    const { id } = req.params;
    const existing = await model.getSupplierById(Number(id));
    if (!existing.length) {
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: this.ResMsg.HTTP_NOT_FOUND,
      };
    }
    await model.updateSupplier(Number(id), req.body);
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: 'Supplier updated',
    };
  }

  public async deleteSupplier(req: Request) {
    const model = this.Model.DynamicFareModel();
    const { id } = req.params;
    const existing = await model.getSupplierById(Number(id));
    if (!existing.length) {
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: this.ResMsg.HTTP_NOT_FOUND,
      };
    }
    await model.deleteSupplier(Number(id));
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: 'Supplier deleted',
    };
  }

  // ------------------ Supplier Airlines Dynamic Fare ------------------
  public async createSupplierAirlinesFare(req: Request) {
    return await this.db.transaction(async (trx) => {
      const model = this.Model.DynamicFareModel(trx);
      const { body } = req.body as {
        body: {
          dynamic_fare_supplier_id: number;
          airline: string;
          from_dac?: boolean;
          to_dac?: boolean;
          soto?: boolean;
          domestic?: boolean;
          commission_type?: 'PER' | 'FLAT';
          commission?: number;
          markup_type?: 'PER' | 'FLAT';
          markup?: number;
          flight_class?: string;
          segment_commission?: number;
          pax_markup?: number;
          segment_commission_type?: 'PER' | 'FLAT';
          segment_markup?: number;
          segment_markup_type?: 'PER' | 'FLAT' | undefined;
        }[];
      };

      const payload: ICreateSupplierAirlinesDynamicFarePayload[] = [];

      for (const elm of body) {
        const airlineCodes = elm.airline
          .split(',')
          .map((code: string) => code.trim().toUpperCase());

        for (const code of airlineCodes) {
          payload.push({
            ...elm,
            airline: code,
          });
        }
      }

      await model.createSupplierAirlinesFare(payload);

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: 'Supplier airline fare created',
      };
    });
  }

  public async getSupplierAirlinesFares(req: Request) {
    const { dynamic_fare_supplier_id } = req.query;
    const model = this.Model.DynamicFareModel();
    const data = await model.getSupplierAirlinesFares({
      dynamic_fare_supplier_id: Number(dynamic_fare_supplier_id),
    });
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data,
    };
  }

  public async updateSupplierAirlinesFare(req: Request) {
    const model = this.Model.DynamicFareModel();
    const { id } = req.params;
    const existing = await model.getSupplierAirlinesFareById(Number(id));
    if (!existing.length) {
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: this.ResMsg.HTTP_NOT_FOUND,
      };
    }
    await model.updateSupplierAirlinesFare(Number(id), req.body);
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: 'Supplier airline fare updated',
    };
  }

  public async deleteSupplierAirlinesFare(req: Request) {
    const model = this.Model.DynamicFareModel();
    const { id } = req.params;
    const existing = await model.getSupplierAirlinesFareById(Number(id));
    if (!existing.length) {
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: this.ResMsg.HTTP_NOT_FOUND,
      };
    }
    await model.deleteSupplierAirlinesFare(Number(id));
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: 'Supplier airline fare deleted',
    };
  }

  // ------------------ Dynamic Fare Tax ------------------
  public async createFareTax(req: Request) {
    return await this.db.transaction(async (trx) => {
      const model = this.Model.DynamicFareModel(trx);
      const { body } = req.body;

      for (const elm of body) {
        const airlineCodes = elm.airline
          .split(',')
          .map((code: string) => code.trim().toUpperCase());

        for (const code of airlineCodes) {
          await model.createFareTax({
            ...elm,
            airline: code,
          });
        }
      }

      return {
        success: true,
        code: this.StatusCode.HTTP_SUCCESSFUL,
        message: 'Fare tax created',
      };
    });
  }

  public async getFareTaxes(req: Request) {
    const { dynamic_fare_supplier_id } = req.query;
    const model = this.Model.DynamicFareModel();
    const data = await model.getFareTaxes({
      dynamic_fare_supplier_id: Number(dynamic_fare_supplier_id),
    });
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data,
    };
  }

  public async updateFareTax(req: Request) {
    const model = this.Model.DynamicFareModel();
    const { id } = req.params;
    const existing = await model.getFareTaxById(Number(id));
    if (!existing.length) {
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: this.ResMsg.HTTP_NOT_FOUND,
      };
    }
    await model.updateFareTax(Number(id), req.body);
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: 'Fare tax updated',
    };
  }

  public async deleteFareTax(req: Request) {
    const model = this.Model.DynamicFareModel();
    const { id } = req.params;
    const existing = await model.getFareTaxById(Number(id));
    if (!existing.length) {
      return {
        success: false,
        code: this.StatusCode.HTTP_NOT_FOUND,
        message: this.ResMsg.HTTP_NOT_FOUND,
      };
    }
    await model.deleteFareTax(Number(id));
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      message: 'Fare tax deleted',
    };
  }

  //upsert btoc commission
  public async upsertBtoCCommission(req: Request) {
    const model = this.Model.DynamicFareModel();
    const { commission_set_id } = req.body;
    await model.upsertB2CCommission({ commission_set_id });
    return {
      success: true,
      code: this.StatusCode.HTTP_SUCCESSFUL,
      message: this.ResMsg.HTTP_SUCCESSFUL,
    };
  }

  //get btoc commission
  public async getBtoCCommission(req: Request) {
    const model = this.Model.DynamicFareModel();
    const data = await model.getB2CCommission();
    return {
      success: true,
      code: this.StatusCode.HTTP_OK,
      data: data,
    };
  }
}

export default AdminDynamicFareRulesService;
