import { Context, Transactional } from 'yuow/core';
import { Command, CommandHandler } from '../../../../shared/cqrs';
import { LessonDto } from '../dtos/lesson.dto';
import { CreateLessonDto } from '../dtos/create-lesson.dto';
import { ExactDate, Lesson, LessonId, TimeInterval } from '../../../domain';
import { DateTime } from 'luxon';
import { TimeIntervalDto } from '../../shared';
import {
  LessonRepository,
  SchoolRepository,
  SubjectRepository,
  TeacherRepository,
} from '../../../database';

export class CreateLessonCommand extends Command<LessonDto> {
  public constructor(
    public readonly schoolId: string,
    public readonly subjectId: string,
    public readonly payload: CreateLessonDto,
  ) {
    super();
  }
}

@CommandHandler(CreateLessonCommand)
export class CreateLessonCommandHandler implements CommandHandler<CreateLessonCommand> {
  @Transactional()
  public async execute({
    schoolId,
    subjectId,
    payload,
  }: CreateLessonCommand): Promise<LessonDto> {
    const schoolRepo = Context.getRepository(SchoolRepository);
    const subjectRepo = Context.getRepository(SubjectRepository);
    const teacherRepo = Context.getRepository(TeacherRepository);
    const lessonRepo = Context.getRepository(LessonRepository);

    const [school, subject, teachers] = await Promise.all([
      schoolRepo.find(schoolId),
      subjectRepo.findBySchool(subjectId, schoolId),
      teacherRepo.findMany(payload.teacherIds, schoolId),
    ]);

    if (!school) {
      throw new Error('School not found');
    }

    if (!subject) {
      throw new Error('Subject not found');
    }

    const id = LessonId.create();
    const date = ExactDate.createFromISO(payload.date);
    const time = TimeInterval.create(payload.time);
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

    lessonRepo.add(lesson);

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
