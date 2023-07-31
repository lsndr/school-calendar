import { MikroORM } from '@mikro-orm/postgresql';
import { Command, CommandHandler } from '../../../../shared/cqrs';
import { LessonDto } from '../dtos/lesson.dto';
import {
  Lesson,
  School,
  Subject,
  Teacher,
  TimeInterval,
} from '../../../domain';
import { DateTime } from 'luxon';
import { UpdateLessonDto } from '../dtos/update-lesson.dto';
import { TimeIntervalDto } from '../../shared';

export class UpdateLessonCommand extends Command<LessonDto> {
  constructor(
    public readonly schoolId: string,
    public readonly subjectId: string,
    public readonly date: string,
    public readonly payload: UpdateLessonDto,
  ) {
    super();
  }
}

@CommandHandler(UpdateLessonCommand)
export class UpdateLessonCommandHandler
  implements CommandHandler<UpdateLessonCommand>
{
  constructor(private readonly orm: MikroORM) {}

  async execute({ schoolId, subjectId, date, payload }: UpdateLessonCommand) {
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
        .where({ id: { $in: payload.teacherIds }, schoolId: schoolId })
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

    if (payload.time !== undefined) {
      const time = TimeInterval.create(payload.time);
      lesson.setTime(time, now);
    }

    if (payload.teacherIds !== undefined) {
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
}
