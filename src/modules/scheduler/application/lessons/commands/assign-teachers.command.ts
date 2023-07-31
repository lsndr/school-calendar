import { MikroORM } from '@mikro-orm/postgresql';
import { Command, CommandProps, CommandHandler } from '../../../../shared/cqrs';
import { Lesson, School, Subject, Teacher } from '../../../domain';
import { DateTime } from 'luxon';
import { AssignTeachersDto } from '../dtos/assign-teachers.dto';
import { AssignedTeacherDto } from '../dtos/assigned-teacher.dto';

export class AssignTeachersCommand extends Command<AssignedTeacherDto[]> {
  public readonly schoolId: string;
  public readonly subjectId: string;
  public readonly date: string;
  public readonly payload: AssignTeachersDto;

  constructor(command: CommandProps<AssignTeachersCommand>) {
    super();

    this.schoolId = command.schoolId;
    this.subjectId = command.subjectId;
    this.date = command.date;
    this.payload = command.payload;
  }
}

@CommandHandler(AssignTeachersCommand)
export class AssignTeachersCommandHandler
  implements CommandHandler<AssignTeachersCommand>
{
  constructor(private readonly orm: MikroORM) {}

  async execute({ schoolId, subjectId, date, payload }: AssignTeachersCommand) {
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
        .where({ id: { $in: payload.teacherIds }, school_id: schoolId })
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
}
