import { Inject, Injectable } from '@nestjs/common';
import { KNEX_PROVIDER, UOW_PROVIDER } from '../../../shared/database';
import { Uow } from 'yuow';
import { GroupRepository, SchoolRepository } from '../../database';
import { Group, GroupId } from '../../domain';
import { Knex } from 'knex';
import { CreateGroupDto } from './create-group.dto';
import { GroupDto } from './group.dto';
import { DateTime } from 'luxon';

@Injectable()
export class GroupsService {
  constructor(
    @Inject(UOW_PROVIDER) private readonly uow: Uow,
    @Inject(KNEX_PROVIDER) private readonly knex: Knex,
  ) {}

  create(dto: CreateGroupDto) {
    return this.uow(async (ctx) => {
      const schoolRepository = ctx.getRepository(SchoolRepository);
      const school = await schoolRepository.findOne({
        id: dto.schoolId,
      });

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

      const groupRepository = ctx.getRepository(GroupRepository);
      groupRepository.add(group);

      return new GroupDto({
        id: group.id.value,
        name: group.name,
      });
    });
  }

  async findOne(id: string) {
    const record = await this.knex
      .select(['id', 'name'])
      .from('groups')
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
