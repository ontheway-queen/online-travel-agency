  
  import { TDB } from '../../features/public/utils/types/commonTypes';
import Schema from '../../utils/miscellaneous/schema';
  
  export class LastServiceEntryModel extends Schema {
    private db: TDB;
    constructor(db: TDB) {
      super();
      this.db = db;
    }
    //increment
    public async incrementLastRefId(payload: {type: string}) {
      await this.db('last_service_entry')
        .withSchema(this.SERVICE_SCHEMA)
        .increment("last_ref_id")
        .where("service_type",payload.type)
    }
  
    //get last entry
    public async getLastRefId(payload: {type: string}){
        const data = await this.db("last_service_entry")
        .withSchema(this.SERVICE_SCHEMA)
        .select("last_ref_id")
        .where("service_type",payload.type);
        return data?.[0]?.last_ref_id;
    }
  }
  