import { type PrismaClient, type Prisma } from '@prisma/client';
import { Repository, EntityState, WeakVersionTracker } from 'yuow/core';
import { type PrismaTransaction } from 'yuow/prisma';
import { DateTime } from 'luxon';
import { Subject } from '../../domain/subject/subject';
import { SubjectId } from '../../domain/subject/subject-id';
import { SchoolId } from '../../domain/school/school-id';
import { GroupId } from '../../domain/group/group-id';
import { TimeInterval } from '../../domain/shared/time-interval';
import {
  RecurrenceType,
  DailyRecurrence,
  WeeklyRecurrence,
  BiWeeklyRecurrence,
  MonthlyRecurrence,
  type Recurrence,
} from '../../domain/subject/recurrence';
import { RequiredTeachers } from '../../domain/subject/required-teachers';

type Tx = PrismaTransaction<PrismaClient, Prisma.TransactionIsolationLevel>;

export class SubjectRepository extends Repository<Subject, Tx> {
  private readonly vt = new WeakVersionTracker<Subject>();

  public async findBySchool(
    id: string,
    schoolId: string,
  ): Promise<Subject | undefined> {
    const r = await this.transaction.prisma.subject.findFirst({
      where: { id, schoolId },
    });

    if (!r) return undefined;

    const subject = new Subject({
      id: new SubjectId(r.id),
      name: r.name,
      schoolId: new SchoolId(r.schoolId),
      groupId: new GroupId(r.groupId),
      recurrence: this.restoreRecurrence(r),
      time: TimeInterval.create({
        startsAt: r.timeStartsAt,
        duration: r.timeDuration,
      }),
      requiredTeachers: RequiredTeachers.create(r.requiredTeachers),
      createdAt: DateTime.fromJSDate(r.createdAt),
      updatedAt: DateTime.fromJSDate(r.updatedAt),
    });

    this.vt.setVersion(subject, r.version);

    return this.changeTracker.getTrackedOrTrack(subject, EntityState.LOADED);
  }

  public async find(id: string): Promise<Subject | undefined> {
    const r = await this.transaction.prisma.subject.findUnique({
      where: { id },
    });

    if (!r) return undefined;

    const subject = new Subject({
      id: new SubjectId(r.id),
      name: r.name,
      schoolId: new SchoolId(r.schoolId),
      groupId: new GroupId(r.groupId),
      recurrence: this.restoreRecurrence(r),
      time: TimeInterval.create({
        startsAt: r.timeStartsAt,
        duration: r.timeDuration,
      }),
      requiredTeachers: RequiredTeachers.create(r.requiredTeachers),
      createdAt: DateTime.fromJSDate(r.createdAt),
      updatedAt: DateTime.fromJSDate(r.updatedAt),
    });

    this.vt.setVersion(subject, r.version);

    return this.changeTracker.getTrackedOrTrack(subject, EntityState.LOADED);
  }

  protected extractIdentity(entity: Subject): unknown {
    return entity.id.value;
  }

  protected async flushInsert(entity: Subject): Promise<boolean> {
    await this.transaction.prisma.subject.create({
      data: this.buildSubjectData(entity, 1),
    });

    await this.writeSubjectLog(entity);

    return true;
  }

  protected async flushUpdate(entity: Subject): Promise<boolean> {
    const v = this.vt.increaseVersion(entity);

    const result = await this.transaction.prisma.subject.updateMany({
      where: { id: entity.id.value, version: v - 1 },
      data: {
        ...this.buildSubjectData(entity, v),
        updatedAt: entity.updatedAt.toJSDate(),
      },
    });

    if (result.count > 0) {
      await this.writeSubjectLog(entity);
    }

    return result.count > 0;
  }

  protected async flushDelete(entity: Subject): Promise<boolean> {
    const result = await this.transaction.prisma.subject.deleteMany({
      where: { id: entity.id.value },
    });

    return result.count > 0;
  }

  private restoreRecurrence(r: {
    recurrenceType: string;
    recurrenceDays: number[];
    recurrenceWeek1: number[];
    recurrenceWeek2: number[];
  }): Recurrence {
    switch (r.recurrenceType as RecurrenceType) {
      case RecurrenceType.Daily:
        return DailyRecurrence.create();
      case RecurrenceType.Weekly:
        return WeeklyRecurrence.create(r.recurrenceDays as any[]);
      case RecurrenceType.BiWeekly:
        return BiWeeklyRecurrence.create({
          week1: r.recurrenceWeek1 as any[],
          week2: r.recurrenceWeek2 as any[],
        });
      case RecurrenceType.Monthly:
        return MonthlyRecurrence.create(r.recurrenceDays as any[]);
      default:
        throw new Error(`Unknown recurrence type: ${r.recurrenceType}`);
    }
  }

  private buildSubjectData(entity: Subject, version: number) {
    const recurrence = entity.recurrence;

    return {
      id: entity.id.value,
      name: entity.name,
      schoolId: entity.schoolId.value,
      groupId: entity.groupId.value,
      recurrenceType: recurrence.type,
      recurrenceDays:
        recurrence.type === RecurrenceType.Weekly ||
        recurrence.type === RecurrenceType.Monthly
          ? [...recurrence.days]
          : [],
      recurrenceWeek1:
        recurrence.type === RecurrenceType.BiWeekly
          ? [...recurrence.week1]
          : [],
      recurrenceWeek2:
        recurrence.type === RecurrenceType.BiWeekly
          ? [...recurrence.week2]
          : [],
      timeStartsAt: entity.time.startsAt,
      timeDuration: entity.time.duration,
      requiredTeachers: entity.requiredTeachers.value,
      version,
      createdAt: entity.createdAt.toJSDate(),
      updatedAt: entity.updatedAt.toJSDate(),
    };
  }

  private async writeSubjectLog(entity: Subject): Promise<void> {
    const recurrence = entity.recurrence;

    await this.transaction.prisma.subjectLog.create({
      data: {
        subjectId: entity.id.value,
        name: entity.name,
        recurrenceType: recurrence.type,
        recurrenceDays:
          recurrence.type === RecurrenceType.Weekly ||
          recurrence.type === RecurrenceType.Monthly
            ? [...recurrence.days]
            : [],
        recurrenceWeek1:
          recurrence.type === RecurrenceType.BiWeekly
            ? [...recurrence.week1]
            : [],
        recurrenceWeek2:
          recurrence.type === RecurrenceType.BiWeekly
            ? [...recurrence.week2]
            : [],
        timeStartsAt: entity.time.startsAt,
        timeDuration: entity.time.duration,
        requiredTeachers: entity.requiredTeachers.value,
        createdAt: entity.updatedAt.toJSDate(),
      },
    });
  }
}
