import { Context, Transactional } from 'yuow/core';
import { Command, CommandProps, CommandHandler } from '../../../../shared/cqrs';
import { School, SchoolId, TimeZone } from '../../../domain';
import { DateTime } from 'luxon';
import { SchoolDto } from '../dtos/school.dto';
import { CreateSchoolDto } from '../dtos/create-school.dto';
import { SchoolRepository } from '../../../database';

export class CreateSchoolCommand extends Command<SchoolDto> {
  public readonly payload: CreateSchoolDto;

  public constructor(command: CommandProps<CreateSchoolCommand>) {
    super();

    this.payload = command.payload;
  }
}

@CommandHandler(CreateSchoolCommand)
export class CreateSchoolCommandHandler implements CommandHandler<CreateSchoolCommand> {
  @Transactional()
  public execute({ payload }: CreateSchoolCommand): SchoolDto {
    const repo = Context.getRepository(SchoolRepository);

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

    repo.add(school);

    return new SchoolDto({
      id: school.id.value,
      name: school.name,
      timeZone: school.timeZone.value,
    });
  }
}
