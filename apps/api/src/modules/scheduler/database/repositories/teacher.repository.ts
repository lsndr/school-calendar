import { type PrismaClient, type Prisma } from '@prisma/client';
import { Repository, EntityState, WeakVersionTracker } from 'yuow/core';
import { type PrismaTransaction } from 'yuow/prisma';
import { DateTime } from 'luxon';
import { Teacher } from '../../domain/teacher/teacher';
import { TeacherId } from '../../domain/teacher/teacher-id';
import { SchoolId } from '../../domain/school/school-id';

type Tx = PrismaTransaction<PrismaClient, Prisma.TransactionIsolationLevel>;

export class TeacherRepository extends Repository<Teacher, Tx> {
  private readonly vt = new WeakVersionTracker<Teacher>();

  public async findMany(ids: string[], schoolId: string): Promise<Teacher[]> {
    const rows = await this.transaction.prisma.teacher.findMany({
      where: { id: { in: ids }, schoolId },
    });

    return rows.map((r) => {
      const teacher = new Teacher({
        id: TeacherId.fromValue(r.id),
        name: r.name,
        schoolId: SchoolId.fromValue(r.schoolId),
        createdAt: DateTime.fromJSDate(r.createdAt),
        updatedAt: DateTime.fromJSDate(r.updatedAt),
      });

      this.vt.setVersion(teacher, r.version);

      return this.changeTracker.getTrackedOrTrack(teacher, EntityState.LOADED);
    });
  }

  public async find(id: string): Promise<Teacher | undefined> {
    const r = await this.transaction.prisma.teacher.findUnique({
      where: { id },
    });

    if (!r) return undefined;

    const teacher = new Teacher({
      id: TeacherId.fromValue(r.id),
      name: r.name,
      schoolId: SchoolId.fromValue(r.schoolId),
      createdAt: DateTime.fromJSDate(r.createdAt),
      updatedAt: DateTime.fromJSDate(r.updatedAt),
    });

    this.vt.setVersion(teacher, r.version);

    return this.changeTracker.getTrackedOrTrack(teacher, EntityState.LOADED);
  }

  protected extractIdentity(entity: Teacher): unknown {
    return entity.id.value;
  }

  protected async flushInsert(entity: Teacher): Promise<boolean> {
    await this.transaction.prisma.teacher.create({
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

  protected async flushUpdate(entity: Teacher): Promise<boolean> {
    const v = this.vt.increaseVersion(entity);

    const result = await this.transaction.prisma.teacher.updateMany({
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

  protected async flushDelete(entity: Teacher): Promise<boolean> {
    const result = await this.transaction.prisma.teacher.deleteMany({
      where: { id: entity.id.value },
    });

    return result.count > 0;
  }
}
