import { Inject, Injectable } from '@nestjs/common';
import { MIKROORM_PROVIDER } from '../../../shared/database';
import { Group, GroupId, School } from '../../domain';
import { CreateGroupDto } from './create-group.dto';
import { GroupDto } from './group.dto';
import { DateTime } from 'luxon';
import { MikroORM } from '@mikro-orm/postgresql';

@Injectable()
export class GroupsService {
  constructor(@Inject(MIKROORM_PROVIDER) private readonly orm: MikroORM) {}

  async create(dto: CreateGroupDto) {
    const em = this.orm.em.fork();
    const schoolRepository = em.getRepository(School);
    const groupRepository = em.getRepository(Group);

    const school = await schoolRepository
      .createQueryBuilder()
      .where({
        id: dto.schoolId,
      })
      .getSingleResult();

    if (!school) {
      throw new Error('School not found');
    }

    const id = GroupId.create();
    const name = dto.name;
    const now = DateTime.now();

    const group = Group.create({
      id,
      name,
      school: school,
      now,
    });

    await groupRepository.persistAndFlush(group);

    return new GroupDto({
      id: group.id.value,
      name: group.name,
    });
  }

  async findOne(id: string) {
    const knex = this.orm.em.getConnection().getKnex();

    const record = await knex
      .select(['id', 'name'])
      .from('group')
      .where('id', id)
      .first();

    if (!record) {
      return;
    }

    return new GroupDto({
      id: record.id,
      name: record.name,
    });
  }
}
