import { Context, Transactional } from 'yuow/core';
import { Command, CommandHandler, CommandProps } from '../../../../shared/cqrs';
import { GroupDto } from '../dtos/group.dto';
import { CreateGroupDto } from '../dtos/create-group.dto';
import { Group, GroupId } from '../../../domain';
import { DateTime } from 'luxon';
import { GroupRepository, SchoolRepository } from '../../../database';

export class CreateGroupCommand extends Command<GroupDto> {
  public readonly schoolId: string;
  public readonly payload: CreateGroupDto;

  public constructor(props: CommandProps<CreateGroupCommand>) {
    super();

    this.schoolId = props.schoolId;
    this.payload = props.payload;
  }
}

@CommandHandler(CreateGroupCommand)
export class CreateGroupCommandHandler implements CommandHandler<CreateGroupCommand> {
  @Transactional()
  public async execute({
    schoolId,
    payload,
  }: CreateGroupCommand): Promise<GroupDto> {
    const schoolRepo = Context.getRepository(SchoolRepository);
    const groupRepo = Context.getRepository(GroupRepository);

    const school = await schoolRepo.find(schoolId);

    if (!school) {
      throw new Error('School not found');
    }

    const id = GroupId.create();
    const name = payload.name;
    const now = DateTime.now();

    const group = Group.create({
      id,
      name,
      school,
      now,
    });

    groupRepo.add(group);

    return new GroupDto({
      id: group.id.value,
      name: group.name,
    });
  }
}
