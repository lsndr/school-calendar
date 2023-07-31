import { MikroORM } from '@mikro-orm/postgresql';
import { Command, CommandProps, CommandHandler } from '../../../../shared/cqrs';
import { School, SchoolId, TimeZone } from '../../../domain';
import { DateTime } from 'luxon';
import { SchoolDto } from '../dtos/school.dto';
import { CreateSchoolDto } from '../dtos/create-school.dto';

export class CreateSchoolCommand extends Command<SchoolDto> {
  public readonly payload: CreateSchoolDto;

  constructor(command: CommandProps<CreateSchoolCommand>) {
    super();

    this.payload = command.payload;
  }
}

@CommandHandler(CreateSchoolCommand)
export class CreateSchoolCommandHandler
  implements CommandHandler<CreateSchoolCommand>
{
  constructor(private readonly orm: MikroORM) {}

  async execute({ payload }: CreateSchoolCommand) {
    const em = this.orm.em.fork();
    const schoolRepository = em.getRepository(School);

    const id = SchoolId.create();
    const name = payload.name;
    const timeZone = TimeZone.create(payload.timeZone);
    const now = DateTime.now();

    const school = School.create({
      id,
      name,
      timeZone,
      now,
    });

    await schoolRepository.persistAndFlush(school);

    return new SchoolDto({
      id: school.id.value,
      name: school.name,
      timeZone: school.timeZone.value,
    });
  }
}
