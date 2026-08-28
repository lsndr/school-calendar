import { Context, Transactional } from 'yuow/core';
import { Command, CommandHandler } from '../../../../shared/cqrs';
import { LessonDto } from '../dtos/lesson.dto';
import { TimeInterval } from '../../../domain';
import { DateTime } from 'luxon';
import { UpdateLessonDto } from '../dtos/update-lesson.dto';
import { TimeIntervalDto } from '../../shared';
import {
  LessonRepository,
  SchoolRepository,
  SubjectRepository,
  TeacherRepository,
} from '../../../database';

export class UpdateLessonCommand extends Command<LessonDto> {
  public constructor(
    public readonly schoolId: string,
    public readonly subjectId: string,
    public readonly date: string,
    public readonly payload: UpdateLessonDto,
  ) {
    super();
  }
}

@CommandHandler(UpdateLessonCommand)
export class UpdateLessonCommandHandler implements CommandHandler<UpdateLessonCommand> {
  @Transactional()
  public async execute({
    schoolId,
    subjectId,
    date,
    payload,
  }: UpdateLessonCommand): Promise<LessonDto> {
    const lessonRepo = Context.getRepository(LessonRepository);
    const schoolRepo = Context.getRepository(SchoolRepository);
    const subjectRepo = Context.getRepository(SubjectRepository);
    const teacherRepo = Context.getRepository(TeacherRepository);

    const [lesson, school, subject, teachers] = await Promise.all([
      lessonRepo.findBySubjectAndDate(subjectId, date, schoolId),
      schoolRepo.find(schoolId),
      subjectRepo.findBySchool(subjectId, schoolId),
      payload.teacherIds
        ? teacherRepo.findMany(payload.teacherIds, schoolId)
        : Promise.resolve([]),
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

    if (payload.time !== undefined) {
      const time = TimeInterval.create(payload.time);
      lesson.setTime(time, now);
    }

    if (payload.teacherIds !== undefined) {
      const teacherMap = new Map(
        teachers.map((teacher) => {
          lesson.assignTeacher(teacher, subject, school, now);
          return [teacher.id.value, teacher];
        }),
      );

      for (const at of lesson.assignedTeachers) {
        if (teacherMap.has(at.teacherId.value)) {
          continue;
        }

        lesson.unassignTeacher(at.teacherId.value, school, now);
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
}
