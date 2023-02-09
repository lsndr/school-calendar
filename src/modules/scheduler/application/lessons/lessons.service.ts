import { Injectable } from '@nestjs/common';
import {
  Lesson,
  LessonId,
  Teacher,
  ExactDate,
  School,
  TimeInterval,
  Subject,
} from '../../domain';
import { DateTime } from 'luxon';
import { CreateLessonDto } from './create-lesson.dto';
import { LessonDto } from './lesson.dto';
import { TimeIntervalDto } from '../subjects/time-interval.dto';
import { UpdateLessonDto } from './update-lesson.dto';
import { AssignTeachersDto } from './assign-teachers.dto';
import { UnassignTeachersDto } from './unassign-teachers.dto';
import { MikroORM } from '@mikro-orm/postgresql';
import { AssignedTeacherDto } from './assigned-teacher.dto';

@Injectable()
export class LessonsService {
  constructor(private readonly orm: MikroORM) {}

  async create(schoolId: string, subjectId: string, dto: CreateLessonDto) {
    const em = this.orm.em.fork();

    const schoolRepository = em.getRepository(School);
    const subjectRepository = em.getRepository(Subject);
    const teacherRepository = em.getRepository(Teacher);
    const lessonRepository = em.getRepository(Lesson);

    const [school, subject, teachers] = await Promise.all([
      schoolRepository
        .createQueryBuilder()
        .where({ id: schoolId })
        .getSingleResult(),
      subjectRepository
        .createQueryBuilder()
        .where({ id: subjectId, school_id: schoolId })
        .getSingleResult(),
      teacherRepository
        .createQueryBuilder()
        .where({ id: { $in: dto.teacherIds }, school_id: schoolId })
        .getResult(),
    ]);

    if (!school) {
      throw new Error('School not found');
    }

    if (!subject) {
      throw new Error('Subject not found');
    }

    const id = LessonId.create();
    const date = ExactDate.createFromISO(dto.date);
    const time = TimeInterval.create(dto.time);
    const now = DateTime.now();

    const lesson = Lesson.create({
      id,
      date,
      subject,
      school,
      time,
      now,
    });

    for (const teacher of teachers) {
      lesson.assignTeacher(teacher, subject, school, now);
    }

    await lessonRepository.persistAndFlush(lesson);

    const assignedTeachers = lesson.assignedTeachers.map((teacher) => ({
      teacherId: teacher.teacherId.value,
      assignedAt: teacher.assignedAt.toISO(),
    }));

    return new LessonDto({
      subjectId: lesson.subjectId.value,
      date: lesson.date.toDateTime().toISODate(),
      assignedTeachers,
      time: new TimeIntervalDto(lesson.time),
      updatedAt: lesson.updatedAt.toISO(),
      createdAt: lesson.createdAt.toISO(),
    });
  }

  async update(
    schoolId: string,
    subjectId: string,
    date: string,
    dto: UpdateLessonDto,
  ) {
    const em = this.orm.em.fork();

    const schoolRepository = em.getRepository(School);
    const subjectRepository = em.getRepository(Subject);
    const teacherRepository = em.getRepository(Teacher);
    const lessonRepository = em.getRepository(Lesson);

    const [lesson, school, subject, teachers] = await Promise.all([
      lessonRepository
        .createQueryBuilder()
        .where({
          subjectId,
          date,
          schoolId,
        })
        .getSingleResult(),
      schoolRepository
        .createQueryBuilder()
        .where({ id: schoolId })
        .getSingleResult(),
      subjectRepository
        .createQueryBuilder()
        .where({ id: subjectId, schoolId: schoolId })
        .getSingleResult(),
      teacherRepository
        .createQueryBuilder()
        .where({ id: { $in: dto.teacherIds }, schoolId: schoolId })
        .getResult(),
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

    if (dto.time !== undefined) {
      const time = TimeInterval.create(dto.time);
      lesson.setTime(time, now);
    }

    if (dto.teacherIds !== undefined) {
      const teachersMap = teachers.reduce<Map<string, Teacher>>(
        (map, teacher) => {
          lesson.assignTeacher(teacher, subject, school, now);

          return map.set(teacher.id.value, teacher);
        },
        new Map(),
      );

      for (const teacher of lesson.assignedTeachers) {
        if (teachersMap.has(teacher.teacherId.value)) {
          continue;
        }

        lesson.unassignTeacher(teacher.teacherId.value, school, now);
      }
    }

    const assignedTeachers = lesson.assignedTeachers.map((teacher) => ({
      teacherId: teacher.teacherId.value,
      assignedAt: teacher.assignedAt.toISO(),
    }));

    return new LessonDto({
      subjectId: lesson.subjectId.value,
      date: lesson.date.toDateTime().toISODate(),
      assignedTeachers,
      time: new TimeIntervalDto(lesson.time),
      updatedAt: lesson.updatedAt.toISO(),
      createdAt: lesson.createdAt.toISO(),
    });
  }

  async assignTeachers(
    schoolId: string,
    subjectId: string,
    date: string,
    dto: AssignTeachersDto,
  ) {
    const em = this.orm.em.fork();

    const schoolRepository = em.getRepository(School);
    const subjectRepository = em.getRepository(Subject);
    const teacherRepository = em.getRepository(Teacher);
    const lessonRepository = em.getRepository(Lesson);

    const [lesson, school, subject, teachers] = await Promise.all([
      lessonRepository
        .createQueryBuilder('a')
        .leftJoinAndSelect('a._assignedTeachers', 'ae')
        .where({
          subject_id: subjectId,
          date,
          school_id: schoolId,
        })
        .getSingleResult(),
      schoolRepository
        .createQueryBuilder()
        .where({ id: schoolId })
        .getSingleResult(),
      subjectRepository
        .createQueryBuilder()
        .where({ id: subjectId, school_id: schoolId })
        .getSingleResult(),
      teacherRepository
        .createQueryBuilder()
        .where({ id: { $in: dto.teacherIds }, school_id: schoolId })
        .getResult(),
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

    await em.flush();

    return lesson.assignedTeachers.map(
      (at) =>
        new AssignedTeacherDto({
          teacherId: at.teacherId.value,
          assignedAt: at.assignedAt.toISO(),
        }),
    );
  }

  async unassignTeachers(
    schoolId: string,
    subjectId: string,
    date: string,
    dto: UnassignTeachersDto,
  ) {
    const em = this.orm.em.fork();

    const schoolRepository = em.getRepository(School);
    const lessonRepository = em.getRepository(Lesson);

    const [lesson, school] = await Promise.all([
      lessonRepository
        .createQueryBuilder('a')
        .leftJoinAndSelect('a._assignedTeachers', 'ae')
        .where({
          subject_id: subjectId,
          date,
          school_id: schoolId,
        })
        .getSingleResult(),
      schoolRepository
        .createQueryBuilder()
        .where({ id: schoolId })
        .getSingleResult(),
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

    await em.flush();

    return lesson.assignedTeachers.map((teacher) => ({
      teacherId: teacher.teacherId.value,
      assignedAt: teacher.assignedAt.toISO(),
    }));
  }

  async findOne(schoolId: string, subjectId: string, date: string) {
    const knex = this.orm.em.getConnection().getKnex();

    const lessonRecord = await knex
      .select([
        'lesson.date',
        'lesson.subject_id',
        'lesson.time_starts_at',
        'lesson.time_duration',
        'lesson.created_at',
        'lesson.updated_at',
        knex
          .select(
            knex.raw(
              `ARRAY_AGG(json_build_object('teacher_id', lesson_teacher.teacher_id, 'assigned_at', lesson_teacher.assigned_at))`,
            ),
          )
          .from('lesson_teacher')
          .whereRaw('lesson_teacher.lesson_id = lesson.id')
          .as('assigned_teachers'),
      ])
      .from('lesson')
      .where('lesson.subject_id', subjectId)
      .where('lesson.school_id', schoolId)
      .where('lesson.date', date)
      .first();

    if (!lessonRecord) {
      return;
    }

    const assignedTeachers = (lessonRecord.assigned_teachers || []).map(
      (teacher: any) =>
        new AssignedTeacherDto({
          teacherId: teacher.teacher_id,
          assignedAt: DateTime.fromISO(teacher.assigned_at).toISO(),
        }),
    );

    return new LessonDto({
      assignedTeachers,
      subjectId: lessonRecord.subject_id,
      date: lessonRecord.date.toISODate(),
      time: new TimeIntervalDto({
        startsAt: lessonRecord.time_starts_at,
        duration: lessonRecord.time_duration,
      }),
      updatedAt: lessonRecord.updated_at.toISO(),
      createdAt: lessonRecord.created_at.toISO(),
    });
  }
}
