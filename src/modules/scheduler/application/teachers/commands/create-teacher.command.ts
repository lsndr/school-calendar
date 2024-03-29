import { MikroORM } from '@mikro-orm/postgresql';
import { Command, CommandHandler, CommandProps } from '@shared/cqrs';
import { School, Teacher, TeacherId } from '../../../domain';
import { DateTime } from 'luxon';
import { TeacherDto } from '../dtos/teacher.dto';
import { CreateTeacherDto } from '../dtos/create-teacher.dto';
import { Transactional } from '@shared/database';

export class CreateTeacherCommand extends Command<TeacherDto> {
  public readonly schoolId: string;
  public readonly payload: CreateTeacherDto;

  constructor(props: CommandProps<CreateTeacherCommand>) {
    super();

    this.schoolId = props.schoolId;
    this.payload = props.payload;
  }
}

@CommandHandler(CreateTeacherCommand)
export class CreateTeacherCommandHandler
  implements CommandHandler<CreateTeacherCommand>
{
  constructor(private readonly orm: MikroORM) {}

  @Transactional()
  async execute({ schoolId, payload }: CreateTeacherCommand) {
    const em = this.orm.em;

    const school = await em
      .createQueryBuilder(School)
      .where({
        id: schoolId,
      })
      .getSingleResult();

    if (!school) {
      throw new Error('School not found');
    }

    const id = TeacherId.create();
    const name = payload.name;

    const teacher = Teacher.create({
      id,
      name,
      school: school,
      now: DateTime.now(),
    });

    em.persist(teacher);

    return new TeacherDto({
      id: teacher.id.value,
      name: teacher.name,
    });
  }
}
