import { MikroORM } from '@mikro-orm/postgresql';
import { Command, CommandProps, CommandHandler } from '../../../../shared/cqrs';
import { Lesson, School, Subject, Teacher } from '../../../domain';
import { DateTime } from 'luxon';
import { AssignTeachersDto } from '../dtos/assign-teachers.dto';
import { AssignedTeacherDto } from '../dtos/assigned-teacher.dto';
import { Transactional } from '../../../../shared/database';

export class AssignTeachersCommand extends Command<AssignedTeacherDto[]> {
  public readonly schoolId: string;
  public readonly subjectId: string;
  public readonly date: string;
  public readonly payload: AssignTeachersDto;

  public constructor(command: CommandProps<AssignTeachersCommand>) {
    super();

    this.schoolId = command.schoolId;
    this.subjectId = command.subjectId;
    this.date = command.date;
    this.payload = command.payload;
  }
}

@CommandHandler(AssignTeachersCommand)
export class AssignTeachersCommandHandler implements CommandHandler<AssignTeachersCommand> {
  public constructor(private readonly orm: MikroORM) {}

  @Transactional()
  public async execute({
    schoolId,
    subjectId,
    date,
    payload,
  }: AssignTeachersCommand): Promise<AssignedTeacherDto[]> {
    const em = this.orm.em;

    const [lesson, school, subject, teachers] = await Promise.all([
      em
        .createQueryBuilder(Lesson, 'a')
        .leftJoinAndSelect('a._assignedTeachers', 'ae')
        .where({
          subject_id: subjectId,
          date,
          school_id: schoolId,
        })
        .getSingleResult(),
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

    return lesson.assignedTeachers.map(
      (at) =>
        new AssignedTeacherDto({
          teacherId: at.teacherId.value,
          assignedAt: at.assignedAt.toISO(),
        }),
    );
  }
}
