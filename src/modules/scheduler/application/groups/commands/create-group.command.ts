import { MikroORM } from '@mikro-orm/postgresql';
import { Command, CommandHandler, CommandProps } from '@shared/cqrs';
import { GroupDto } from '../dtos/group.dto';
import { CreateGroupDto } from '../dtos/create-group.dto';
import { Group, GroupId, School } from '../../../domain';
import { DateTime } from 'luxon';

export class CreateGroupCommand extends Command<GroupDto> {
  public readonly schoolId: string;
  public readonly payload: CreateGroupDto;

  constructor(props: CommandProps<CreateGroupCommand>) {
    super();

    this.schoolId = props.schoolId;
    this.payload = props.payload;
  }
}

@CommandHandler(CreateGroupCommand)
export class CreateGroupCommandHandler
  implements CommandHandler<CreateGroupCommand>
{
  constructor(private readonly orm: MikroORM) {}

  async execute({ schoolId, payload }: CreateGroupCommand) {
    const em = this.orm.em.fork();
    const schoolRepository = em.getRepository(School);
    const groupRepository = em.getRepository(Group);

    const school = await schoolRepository
      .createQueryBuilder()
      .where({
        id: schoolId,
      })
      .getSingleResult();

    if (!school) {
      throw new Error('School not found');
    }

    const id = GroupId.create();
    const name = payload.name;
    const now = DateTime.now();

    const group = Group.create({
      id,
      name,
      school: school,
      now,
    });

    await groupRepository.persistAndFlush(group);

    return new GroupDto({
      id: group.id.value,
      name: group.name,
    });
  }
}
