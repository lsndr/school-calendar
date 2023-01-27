import { Inject, Injectable } from '@nestjs/common';
import { KNEX_PROVIDER, UOW_PROVIDER } from '../../../shared/database';
import { Uow } from 'yuow';
import {
  LessonRepository,
  TeacherRepository,
  SchoolRepository,
  SubjectRepository,
} from '../../database';
import {
  Lesson,
  LessonId,
  Teacher,
  ExactDate,
  TimeInterval,
} from '../../domain';
import { Knex } from 'knex';
import { DateTime } from 'luxon';
import { CreateLessonDto } from './create-lesson.dto';
import { LessonDto } from './lesson.dto';
import { TimeIntervalDto } from '../subjects/time-interval.dto';
import { UpdateLessonDto } from './update-lesson.dto';
import { AssignTeachersDto } from './assign-teachers.dto';
import { UnassignTeachersDto } from './unassign-teachers.dto';

@Injectable()
export class LessonsService {
  constructor(
    @Inject(UOW_PROVIDER) private readonly uow: Uow,
    @Inject(KNEX_PROVIDER) private readonly knex: Knex,
  ) {}

  create(schoolId: string, subjectId: string, dto: CreateLessonDto) {
    return this.uow(async (ctx) => {
      const schoolRepository = ctx.getRepository(SchoolRepository);
      const subjectRepository = ctx.getRepository(SubjectRepository);
      const teacherRepository = ctx.getRepository(TeacherRepository);
      const lessonRepository = ctx.getRepository(LessonRepository);

      const [school, subject, teachers] = await Promise.all([
        schoolRepository.findOne({
          id: schoolId,
        }),
        subjectRepository.findOne({
          id: subjectId,
          schoolId: schoolId,
        }),
        teacherRepository.findMany({
          ids: dto.teacherIds,
          schoolId: schoolId,
        }),
      ]);

      if (!school) {
        throw new Error('School not found');
      }

      if (!subject) {
        throw new Error('Subject not found');
      }

      const date = ExactDate.createFromISO(dto.date);
      const id = LessonId.create(subject.id, date);
      const timeInterval = TimeInterval.create(dto.timeInterval);
      const now = DateTime.now();

      const lesson = Lesson.create({
        id,
        school,
        timeInterval,
        now,
      });

      lessonRepository.add(lesson);

      for (const teacher of teachers) {
        lesson.assignTeacher(teacher, subject, school, now);
      }

      const teacherIds = Array.from(lesson.teacherIds).map((id) => id.value);

      return new LessonDto({
        subjectId: lesson.id.subjectId.value,
        date: lesson.id.date.toDateTime().toISODate(),
        teacherIds,
        timeInterval: new TimeIntervalDto(lesson.timeInterval),
        updatedAt: lesson.updatedAt.toISO(),
        createdAt: lesson.createdAt.toISO(),
      });
    });
  }

  update(
    schoolId: string,
    subjectId: string,
    date: string,
    dto: UpdateLessonDto,
  ) {
    return this.uow(async (ctx) => {
      const schoolRepository = ctx.getRepository(SchoolRepository);
      const subjectRepository = ctx.getRepository(SubjectRepository);
      const teacherRepository = ctx.getRepository(TeacherRepository);
      const lessonRepository = ctx.getRepository(LessonRepository);

      const [lesson, school, subject, teachers] = await Promise.all([
        lessonRepository.findOne({
          id: {
            subjectId,
            date,
          },
        }),
        schoolRepository.findOne({
          id: schoolId,
        }),
        subjectRepository.findOne({
          id: subjectId,
          schoolId: schoolId,
        }),
        teacherRepository.findMany({
          ids: dto.teacherIds,
          schoolId: schoolId,
        }),
      ]);

      if (!lesson) {
        throw new Error('Lesson not found');
      }

      if (!school) {
        throw new Error('School not found');
      }

      if (!subject) {
        throw new Error('Subject not found');
      }

      const now = DateTime.now();

      if (dto.timeInterval !== undefined) {
        const timeInterval = TimeInterval.create(dto.timeInterval);
        lesson.setTimeInterval(timeInterval, now);
      }

      if (dto.teacherIds !== undefined) {
        const teachersMap = teachers.reduce<Map<string, Teacher>>(
          (map, teacher) => {
            lesson.assignTeacher(teacher, subject, school, now);

            return map.set(teacher.id.value, teacher);
          },
          new Map(),
        );

        for (const id of lesson.teacherIds) {
          if (teachersMap.has(id.value)) {
            continue;
          }

          lesson.unassignTeacher(id.value, school, now);
        }
      }

      const teacherIds = lesson.teacherIds.map((id) => id.value);

      return new LessonDto({
        subjectId: lesson.id.subjectId.value,
        date: lesson.id.date.toDateTime().toISODate(),
        teacherIds,
        timeInterval: new TimeIntervalDto(lesson.timeInterval),
        updatedAt: lesson.updatedAt.toISO(),
        createdAt: lesson.createdAt.toISO(),
      });
    });
  }

  assignTeacher(
    schoolId: string,
    subjectId: string,
    date: string,
    dto: AssignTeachersDto,
  ) {
    return this.uow(async (ctx) => {
      const schoolRepository = ctx.getRepository(SchoolRepository);
      const subjectRepository = ctx.getRepository(SubjectRepository);
      const teacherRepository = ctx.getRepository(TeacherRepository);
      const lessonRepository = ctx.getRepository(LessonRepository);

      const [lesson, school, subject, teachers] = await Promise.all([
        lessonRepository.findOne({
          id: {
            subjectId,
            date,
          },
        }),
        schoolRepository.findOne({
          id: schoolId,
        }),
        subjectRepository.findOne({
          id: subjectId,
          schoolId: schoolId,
        }),
        teacherRepository.findMany({
          ids: dto.teacherIds,
          schoolId: schoolId,
        }),
      ]);

      if (!lesson) {
        throw new Error('Lesson not found');
      }

      if (!school) {
        throw new Error('School not found');
      }

      if (!subject) {
        throw new Error('Subject not found');
      }

      const now = DateTime.now();

      for (const teacher of teachers) {
        lesson.assignTeacher(teacher, subject, school, now);
      }

      const teacherIds = lesson.teacherIds.map((id) => id.value);

      return new LessonDto({
        subjectId: lesson.id.subjectId.value,
        date: lesson.id.date.toDateTime().toISODate(),
        teacherIds,
        timeInterval: new TimeIntervalDto(lesson.timeInterval),
        updatedAt: lesson.updatedAt.toISO(),
        createdAt: lesson.createdAt.toISO(),
      });
    });
  }

  unassignTeacher(
    schoolId: string,
    subjectId: string,
    date: string,
    dto: UnassignTeachersDto,
  ) {
    return this.uow(async (ctx) => {
      const schoolRepository = ctx.getRepository(SchoolRepository);
      const lessonRepository = ctx.getRepository(LessonRepository);

      const [lesson, school] = await Promise.all([
        lessonRepository.findOne({
          id: {
            subjectId,
            date,
          },
          schoolId,
        }),
        schoolRepository.findOne({
          id: schoolId,
        }),
      ]);

      if (!lesson) {
        throw new Error('Lesson not found');
      }

      if (!school) {
        throw new Error('School not found');
      }

      const now = DateTime.now();

      for (const id of dto.teacherIds) {
        lesson.unassignTeacher(id, school, now);
      }

      const teacherIds = lesson.teacherIds.map((id) => id.value);

      return new LessonDto({
        subjectId: lesson.id.subjectId.value,
        date: lesson.id.date.toDateTime().toISODate(),
        teacherIds,
        timeInterval: new TimeIntervalDto(lesson.timeInterval),
        updatedAt: lesson.updatedAt.toISO(),
        createdAt: lesson.createdAt.toISO(),
      });
    });
  }

  async findOne(schoolId: string, subjectId: string, date: string) {
    const dateTime = DateTime.fromISO(date);

    const [lessonRecord, teacherRecords] = await Promise.all([
      this.knex
        .select([
          'lessons.date',
          'lessons.subject_id',
          'lessons.starts_at',
          'lessons.duration',
          'lessons.created_at',
          'lessons.updated_at',
        ])
        .from('lessons')
        .innerJoin('subjects', 'lessons.subject_id', 'subjects.id')
        .where('lessons.subject_id', subjectId)
        .where('subjects.school_id', schoolId)
        .where('lessons.date', dateTime.toSQLDate())
        .first(),
      this.knex
        .select('teacher_id')
        .from('lessons_teachers')
        .where('subject_id', subjectId),
    ]);

    if (!lessonRecord) {
      return;
    }

    const teacherIds = teacherRecords.map((record: any) => record.teacher_id);

    return new LessonDto({
      teacherIds,
      subjectId: lessonRecord.subject_id,
      date: lessonRecord.date.toISODate(),
      timeInterval: new TimeIntervalDto({
        startsAt: lessonRecord.starts_at,
        duration: lessonRecord.duration,
      }),
      updatedAt: lessonRecord.updated_at.toISO(),
      createdAt: lessonRecord.created_at.toISO(),
    });
  }
}
