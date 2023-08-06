import { MikroORM } from '@mikro-orm/postgresql';
import { Command, CommandHandler } from '@shared/cqrs';
import { LessonDto } from '../dtos/lesson.dto';
import { CreateLessonDto } from '../dtos/create-lesson.dto';
import {
  ExactDate,
  Lesson,
  LessonId,
  School,
  Subject,
  Teacher,
  TimeInterval,
} from '../../../domain';
import { DateTime } from 'luxon';
import { TimeIntervalDto } from '../../shared';
import { Transactional } from '@shared/database';

export class CreateLessonCommand extends Command<LessonDto> {
  constructor(
    public readonly schoolId: string,
    public readonly subjectId: string,
    public readonly payload: CreateLessonDto,
  ) {
    super();
  }
}

@CommandHandler(CreateLessonCommand)
export class CreateLessonCommandHandler
  implements CommandHandler<CreateLessonCommand>
{
  constructor(private readonly orm: MikroORM) {}

  @Transactional()
  async execute({ schoolId, subjectId, payload }: CreateLessonCommand) {
    const em = this.orm.em;

    const [school, subject, teachers] = await Promise.all([
      em.createQueryBuilder(School).where({ id: schoolId }).getSingleResult(),
      em
        .createQueryBuilder(Subject)
        .where({ id: subjectId, school_id: schoolId })
        .getSingleResult(),
      em
        .createQueryBuilder(Teacher)
        .where({ id: { $in: payload.teacherIds }, school_id: schoolId })
        .getResult(),
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

    em.persist(lesson);

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
