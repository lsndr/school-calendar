import { type PrismaClient, type Prisma } from '@prisma/client';
import { Repository, EntityState, WeakVersionTracker } from 'yuow/core';
import { type PrismaTransaction } from 'yuow/prisma';
import { DateTime } from 'luxon';
import { randomUUID } from 'crypto';
import { Lesson } from '../../domain/lesson/lesson';
import { LessonId } from '../../domain/lesson/lesson-id';
import { AssignedTeacher } from '../../domain/lesson/assigned-teacher';
import { AssignedTeacherId } from '../../domain/lesson/assigned-teacher-id';
import { SubjectId } from '../../domain/subject/subject-id';
import { SchoolId } from '../../domain/school/school-id';
import { TeacherId } from '../../domain/teacher/teacher-id';
import { ExactDate } from '../../domain/shared/exact-date';
import { TimeInterval } from '../../domain/shared/time-interval';

type Tx = PrismaTransaction<PrismaClient, Prisma.TransactionIsolationLevel>;

export class LessonRepository extends Repository<Lesson, Tx> {
  private readonly vt = new WeakVersionTracker<Lesson>();

  public async findBySubjectAndDate(
    subjectId: string,
    date: string,
    schoolId: string,
  ): Promise<Lesson | undefined> {
    const [year, month, day] = date.split('-').map(Number) as [
      number,
      number,
      number,
    ];
    const dateValue = new Date(Date.UTC(year, month - 1, day));

    const r = await this.transaction.prisma.lesson.findFirst({
      where: { subjectId, date: dateValue, schoolId },
      include: { teachers: true },
    });

    if (!r) return undefined;

    // eslint-disable-next-line local/no-protected-constructor-usage -- state recovery
    const lesson = new Lesson({
      // eslint-disable-next-line local/no-protected-constructor-usage -- state recovery
      id: new LessonId(r.id),
      // eslint-disable-next-line local/no-protected-constructor-usage -- state recovery
      subjectId: new SubjectId(r.subjectId!),
      // eslint-disable-next-line local/no-protected-constructor-usage -- state recovery
      schoolId: new SchoolId(r.schoolId),
      date: ExactDate.create({
        year: r.date.getUTCFullYear(),
        month: r.date.getUTCMonth() + 1,
        day: r.date.getUTCDate(),
      }),
      time: TimeInterval.create({
        startsAt: r.timeStartsAt,
        duration: r.timeDuration,
      }),
      assignedTeachers: r.teachers.map(
        (t) =>
          // eslint-disable-next-line local/no-protected-constructor-usage -- state recovery
          new AssignedTeacher({
            // eslint-disable-next-line local/no-protected-constructor-usage -- state recovery
            id: new AssignedTeacherId(t.id),
            // eslint-disable-next-line local/no-protected-constructor-usage -- state recovery
            teacherId: new TeacherId(t.teacherId),
            assignedAt: DateTime.fromJSDate(t.assignedAt),
          }),
      ),
      createdAt: DateTime.fromJSDate(r.createdAt),
      updatedAt: DateTime.fromJSDate(r.updatedAt),
    });

    this.vt.setVersion(lesson, r.version);

    return this.changeTracker.getTrackedOrTrack(lesson, EntityState.LOADED);
  }

  public async find(id: string): Promise<Lesson | undefined> {
    const r = await this.transaction.prisma.lesson.findUnique({
      where: { id },
      include: { teachers: true },
    });

    if (!r) return undefined;

    // eslint-disable-next-line local/no-protected-constructor-usage -- state recovery
    const lesson = new Lesson({
      // eslint-disable-next-line local/no-protected-constructor-usage -- state recovery
      id: new LessonId(r.id),
      // eslint-disable-next-line local/no-protected-constructor-usage -- state recovery
      subjectId: new SubjectId(r.subjectId!),
      // eslint-disable-next-line local/no-protected-constructor-usage -- state recovery
      schoolId: new SchoolId(r.schoolId),
      date: ExactDate.create({
        year: r.date.getUTCFullYear(),
        month: r.date.getUTCMonth() + 1,
        day: r.date.getUTCDate(),
      }),
      time: TimeInterval.create({
        startsAt: r.timeStartsAt,
        duration: r.timeDuration,
      }),
      assignedTeachers: r.teachers.map(
        (t) =>
          // eslint-disable-next-line local/no-protected-constructor-usage -- state recovery
          new AssignedTeacher({
            // eslint-disable-next-line local/no-protected-constructor-usage -- state recovery
            id: new AssignedTeacherId(t.id),
            // eslint-disable-next-line local/no-protected-constructor-usage -- state recovery
            teacherId: new TeacherId(t.teacherId),
            assignedAt: DateTime.fromJSDate(t.assignedAt),
          }),
      ),
      createdAt: DateTime.fromJSDate(r.createdAt),
      updatedAt: DateTime.fromJSDate(r.updatedAt),
    });

    this.vt.setVersion(lesson, r.version);

    return this.changeTracker.getTrackedOrTrack(lesson, EntityState.LOADED);
  }

  protected extractIdentity(entity: Lesson): unknown {
    return entity.id.value;
  }

  protected async flushInsert(entity: Lesson): Promise<boolean> {
    await this.transaction.prisma.lesson.create({
      data: {
        id: entity.id.value,
        subjectId: entity.subjectId.value,
        schoolId: entity.schoolId.value,
        date: new Date(
          Date.UTC(entity.date.year, entity.date.month - 1, entity.date.day),
        ),
        timeStartsAt: entity.time.startsAt,
        timeDuration: entity.time.duration,
        version: 1,
        createdAt: entity.createdAt.toJSDate(),
        updatedAt: entity.updatedAt.toJSDate(),
        teachers: {
          create: entity.assignedTeachers.map((at) => ({
            id: at.id.value,
            teacherId: at.teacherId.value,
            assignedAt: at.assignedAt.toJSDate(),
          })),
        },
      },
    });

    await this.flushOutbox(entity);

    return true;
  }

  protected async flushUpdate(entity: Lesson): Promise<boolean> {
    const v = this.vt.increaseVersion(entity);

    const result = await this.transaction.prisma.lesson.updateMany({
      where: { id: entity.id.value, version: v - 1 },
      data: {
        timeStartsAt: entity.time.startsAt,
        timeDuration: entity.time.duration,
        updatedAt: entity.updatedAt.toJSDate(),
        version: v,
      },
    });

    if (result.count > 0) {
      await this.syncTeachers(entity);
      await this.flushOutbox(entity);
    }

    return result.count > 0;
  }

  protected async flushDelete(entity: Lesson): Promise<boolean> {
    await this.transaction.prisma.lessonTeacher.deleteMany({
      where: { lessonId: entity.id.value },
    });

    const result = await this.transaction.prisma.lesson.deleteMany({
      where: { id: entity.id.value },
    });

    return result.count > 0;
  }

  private async syncTeachers(entity: Lesson): Promise<void> {
    const existing = await this.transaction.prisma.lessonTeacher.findMany({
      where: { lessonId: entity.id.value },
      select: { id: true, teacherId: true },
    });

    const currentTeacherIds = new Set(
      entity.assignedTeachers.map((at) => at.teacherId.value),
    );
    const existingTeacherIds = new Set(existing.map((t) => t.teacherId));

    const toDelete = existing.filter(
      (t) => !currentTeacherIds.has(t.teacherId),
    );
    const toAdd = entity.assignedTeachers.filter(
      (at) => !existingTeacherIds.has(at.teacherId.value),
    );

    if (toDelete.length > 0) {
      await this.transaction.prisma.lessonTeacher.deleteMany({
        where: { id: { in: toDelete.map((t) => t.id) } },
      });
    }

    for (const at of toAdd) {
      await this.transaction.prisma.lessonTeacher.create({
        data: {
          id: at.id.value,
          lessonId: entity.id.value,
          teacherId: at.teacherId.value,
          assignedAt: at.assignedAt.toJSDate(),
        },
      });
    }
  }

  private async flushOutbox(entity: Lesson): Promise<void> {
    const events = entity.events;

    if (events.length === 0) return;

    const now = DateTime.now().toJSDate();

    for (const event of events) {
      await this.transaction.prisma.outbox.create({
        data: {
          id: randomUUID(),
          topic: `scheduler.${event.constructor.name}`,
          payload: event as object,
          createdAt: now,
        },
      });
    }
  }
}
