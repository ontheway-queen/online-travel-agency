import { TDB } from '../../features/public/utils/types/commonTypes';
import {
  IPermission,
  IRole,
} from '../../utils/interfaces/admin/administrationInterface';
import Schema from '../../utils/miscellaneous/schema';

class BtobAdministrationModel extends Schema {
  private db: TDB;

  constructor(db: TDB) {
    super();
    this.db = db;
  }

  //Role

  public async createRole(payload: IRole) {
    return await this.db('roles')
      .withSchema(this.AGENT_SCHEMA)
      .insert(payload, 'id');
  }

  // update role
  public async updateRole(
    { name, status }: { name?: string; status?: number },
    id: number
  ) {
    return await this.db('roles')
      .withSchema(this.AGENT_SCHEMA)
      .update({ name, status })
      .where({ id });
  }

  public async roleList({
    agency_id,
    limit,
    skip,
  }: {
    limit: number;
    skip: number;
    agency_id: number;
  }) {
    const data = await this.db('roles as rl')
      .withSchema(this.AGENT_SCHEMA)
      .select(
        'rl.id as role_id',
        'rl.name as role_name',
        'bu.name as created_by',
        'rl.create_date'
      )
      .leftJoin('btob_user as bu', 'bu.id', 'rl.created_by')
      .where('rl.agency_id', agency_id)
      .limit(limit ? limit : 100)
      .offset(skip ? skip : 0)
      .orderBy('rl.id', 'asc');

    let count: any[] = [];

    count = await this.db('roles as rl')
      .withSchema(this.AGENT_SCHEMA)
      .count('rl.id as total');

    return { data, total: count[0]?.total };
  }

  public async getSingleRole({
    id,
    name,
    permission_id,
    agency_id,
  }: {
    id?: number;
    agency_id: number;
    name?: string;
    permission_id?: number;
  }) {
    // console.log({ id });
    return await this.db('roles as rol')
      .withSchema(this.AGENT_SCHEMA)
      .select(
        'rol.id as role_id',
        'rol.name as role_name',
        'rol.status',
        this.db.raw(`
          case when exists (
            select 1
            from ${this.AGENT_SCHEMA}.role_permissions rp
            where rp.role_id = rol.id
          ) then (
            select json_agg(
              json_build_object(
                'permission_id', per.id,
                'permission_name', per.name,
                'read', rp.read,
                'write', rp.write,
                'update', rp.update,
                'delete', rp.delete
              )
                    order by per.name asc
            )
            from ${this.AGENT_SCHEMA}.role_permissions rp
            join ${this.AGENT_SCHEMA}.permissions per
            on rp.permission_id = per.id
            where rp.role_id = rol.id
            group by rp.role_id
          ) else '[]' end as permissions
        `)
      )
      .where((qb) => {
        if (id) {
          qb.andWhere('rol.id', id);
        }
        if (agency_id) {
          qb.andWhere('rol.agency_id', agency_id);
        }
        if (name) {
          qb.andWhere('rol.name', name);
        }
        if (permission_id) {
          qb.andWhere('per.id', permission_id);
        }
      });
  }

  //Permission
  public async createPermission(payload: IPermission) {
    return await this.db('permissions')
      .withSchema(this.AGENT_SCHEMA)
      .insert(payload, 'id');
  }

  public async permissionsList(params: {
    name?: string;
    limit?: number;
    skip?: number;
  }) {
    const data = await this.db('permissions as per')
      .withSchema(this.AGENT_SCHEMA)
      .select(
        'per.id as permission_id',
        'per.name as permission_name',
        'per.create_date'
      )
      .leftJoin('btob_user as ua', 'ua.id', 'per.created_by')
      .limit(params.limit ? params.limit : 100)
      .offset(params.skip ? params.skip : 0)
      .orderBy('per.id', 'asc')
      .where((qb) => {
        if (params.name) {
          qb.where('per.name', params.name);
        }
      });

    let count: any[] = [];

    count = await this.db('permissions')
      .withSchema(this.AGENT_SCHEMA)
      .count('id as total')
      .where((qb) => {
        if (params.name) {
          qb.where('name', params.name);
        }
      });

    return { data, total: count[0]?.total };
  }

  //Role Permission
  public async createRolePermission(
    payload: {
      role_id: number;
      permission_id: number;
      read?: number;
      write?: number;
      update?: number;
      delete?: number;
      created_by?: number;
    }[]
  ) {
    return await this.db('role_permissions')
      .withSchema(this.AGENT_SCHEMA)
      .insert(payload, 'role_id');
  }

  // delete role permission
  public async deleteRolePermission(payload: {
    role_id: number;
    permission_id: number;
  }) {
    return await this.db('role_permissions')
      .withSchema(this.AGENT_SCHEMA)
      .delete()
      .where('role_id', payload.role_id)
      .andWhere('permission_id', payload.permission_id);
  }

  // update role permission
  public async updateRolePermission(
    payload: {
      write: number;
      update: number;
      delete: number;
      read: number;
      updated_by: number;
    },
    permission_id: number,
    role_id: number
  ) {
    return await this.db('role_permissions')
      .withSchema(this.AGENT_SCHEMA)
      .update(payload)
      .where('role_id', role_id)
      .andWhere('permission_id', permission_id);
  }

  // get role permission
  public async getRolePermissions(role_id: number, permission_id: number) {
    return await this.db('role_permissions')
      .withSchema(this.AGENT_SCHEMA)
      .where({ role_id })
      .andWhere({ permission_id });
  }
}
export default BtobAdministrationModel;
