import { MikroORM } from '@mikro-orm/postgresql';
import { Command, CommandHandler, CommandProps } from '@shared/cqrs';
import { Lesson, School } from '../../../domain';
import { DateTime } from 'luxon';
import { AssignedTeacherDto } from '../dtos/assigned-teacher.dto';
import { UnassignTeachersDto } from '../dtos/unassign-teachers.dto';
import { Transactional } from '@shared/database';

export class UnassignTeachersCommand extends Command<AssignedTeacherDto[]> {
  public readonly schoolId: string;
  public readonly subjectId: string;
  public readonly date: string;
  public readonly payload: UnassignTeachersDto;

  constructor(props: CommandProps<UnassignTeachersCommand>) {
    super();

    this.schoolId = props.schoolId;
    this.subjectId = props.subjectId;
    this.date = props.date;
    this.payload = props.payload;
  }
}

@CommandHandler(UnassignTeachersCommand)
export class UnassignTeachersCommandHandler
  implements CommandHandler<UnassignTeachersCommand>
{
  constructor(private readonly orm: MikroORM) {}

  @Transactional()
  async execute({
    schoolId,
    subjectId,
    date,
    payload,
  }: UnassignTeachersCommand) {
    const em = this.orm.em;

    const [lesson, school] = await Promise.all([
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
    ]);

    if (!lesson) {
      throw new Error('Lesson not found');
    }

    if (!school) {
      throw new Error('School not found');
    }

    const now = DateTime.now();

    for (const id of payload.teacherIds) {
      lesson.unassignTeacher(id, school, now);
    }

    return lesson.assignedTeachers.map((teacher) => ({
      teacherId: teacher.teacherId.value,
      assignedAt: teacher.assignedAt.toISO(),
    }));
  }
}
