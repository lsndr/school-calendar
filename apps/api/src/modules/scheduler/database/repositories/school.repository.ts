import { type PrismaClient, type Prisma } from '@prisma/client';
import { Repository, EntityState, WeakVersionTracker } from 'yuow/core';
import { type PrismaTransaction } from 'yuow/prisma';
import { DateTime } from 'luxon';
import { School } from '../../domain/school/school';
import { SchoolId } from '../../domain/school/school-id';
import { TimeZone } from '../../domain/shared';

type Tx = PrismaTransaction<PrismaClient, Prisma.TransactionIsolationLevel>;

export class SchoolRepository extends Repository<School, Tx> {
  private readonly vt = new WeakVersionTracker<School>();

  public async find(id: string): Promise<School | undefined> {
    const r = await this.transaction.prisma.school.findUnique({
      where: { id },
    });

    if (!r) return undefined;

    const school = new School({
      id: SchoolId.fromValue(r.id),
      name: r.name,
      timeZone: TimeZone.create(r.timeZone),
      createdAt: DateTime.fromJSDate(r.createdAt),
      updatedAt: DateTime.fromJSDate(r.updatedAt),
    });

    this.vt.setVersion(school, r.version);

    return this.changeTracker.getTrackedOrTrack(school, EntityState.LOADED);
  }

  protected extractIdentity(entity: School): unknown {
    return entity.id.value;
  }

  protected async flushInsert(entity: School): Promise<boolean> {
    await this.transaction.prisma.school.create({
      data: {
        id: entity.id.value,
        name: entity.name,
        timeZone: entity.timeZone.value,
        version: 1,
        createdAt: entity.createdAt.toJSDate(),
        updatedAt: entity.updatedAt.toJSDate(),
      },
    });

    return true;
  }

  protected async flushUpdate(entity: School): Promise<boolean> {
    const v = this.vt.increaseVersion(entity);

    const result = await this.transaction.prisma.school.updateMany({
      where: { id: entity.id.value, version: v - 1 },
      data: {
        name: entity.name,
        timeZone: entity.timeZone.value,
        updatedAt: entity.updatedAt.toJSDate(),
        version: v,
      },
    });

    return result.count > 0;
  }

  protected async flushDelete(entity: School): Promise<boolean> {
    const result = await this.transaction.prisma.school.deleteMany({
      where: { id: entity.id.value },
    });

    return result.count > 0;
  }
}
