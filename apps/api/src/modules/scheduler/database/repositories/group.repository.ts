import { type PrismaClient, type Prisma } from '@prisma/client';
import { Repository, EntityState, WeakVersionTracker } from 'yuow/core';
import { type PrismaTransaction } from 'yuow/prisma';
import { DateTime } from 'luxon';
import { Group } from '../../domain/group/group';
import { GroupId } from '../../domain/group/group-id';
import { SchoolId } from '../../domain/school/school-id';

type Tx = PrismaTransaction<PrismaClient, Prisma.TransactionIsolationLevel>;

export class GroupRepository extends Repository<Group, Tx> {
  private readonly vt = new WeakVersionTracker<Group>();

  public async find(id: string): Promise<Group | undefined> {
    const r = await this.transaction.prisma.group.findUnique({ where: { id } });

    if (!r) return undefined;

    const group = new Group({
      id: new GroupId(r.id),
      name: r.name,
      schoolId: new SchoolId(r.schoolId),
      createdAt: DateTime.fromJSDate(r.createdAt),
      updatedAt: DateTime.fromJSDate(r.updatedAt),
    });

    this.vt.setVersion(group, r.version);

    return this.changeTracker.getTrackedOrTrack(group, EntityState.LOADED);
  }

  protected extractIdentity(entity: Group): unknown {
    return entity.id.value;
  }

  protected async flushInsert(entity: Group): Promise<boolean> {
    await this.transaction.prisma.group.create({
      data: {
        id: entity.id.value,
        name: entity.name,
        schoolId: entity.schoolId.value,
        version: 1,
        createdAt: entity.createdAt.toJSDate(),
        updatedAt: entity.updatedAt.toJSDate(),
      },
    });

    return true;
  }

  protected async flushUpdate(entity: Group): Promise<boolean> {
    const v = this.vt.increaseVersion(entity);

    const result = await this.transaction.prisma.group.updateMany({
      where: { id: entity.id.value, version: v - 1 },
      data: {
        name: entity.name,
        schoolId: entity.schoolId.value,
        updatedAt: entity.updatedAt.toJSDate(),
        version: v,
      },
    });

    return result.count > 0;
  }

  protected async flushDelete(entity: Group): Promise<boolean> {
    const result = await this.transaction.prisma.group.deleteMany({
      where: { id: entity.id.value },
    });

    return result.count > 0;
  }
}
