import { Context, Transactional } from 'yuow/core';
import { Command, CommandHandler, CommandProps } from '../../../../shared/cqrs';
import {
  RequiredTeachers,
  Subject,
  SubjectId,
  TimeInterval,
} from '../../../domain';
import { DateTime } from 'luxon';
import { CreateSubjectDto } from '../dtos/create-subject.dto';
import { SubjectDto } from '../dtos/subject.dto';
import { mapDtoToRecurrence, mapRecurrenceToDto } from '../helpers/mappers';
import { TimeIntervalDto } from '../../shared';
import {
  GroupRepository,
  SchoolRepository,
  SubjectRepository,
} from '../../../database';

export class CreateSubjectCommand extends Command<SubjectDto> {
  public readonly schoolId: string;
  public readonly payload: CreateSubjectDto;

  public constructor(props: CommandProps<CreateSubjectCommand>) {
    super();

    this.schoolId = props.schoolId;
    this.payload = props.payload;
  }
}

@CommandHandler(CreateSubjectCommand)
export class CreateSubjectCommandHandler implements CommandHandler<CreateSubjectCommand> {
  @Transactional()
  public async execute({
    schoolId,
    payload,
  }: CreateSubjectCommand): Promise<SubjectDto> {
    const schoolRepo = Context.getRepository(SchoolRepository);
    const groupRepo = Context.getRepository(GroupRepository);
    const subjectRepo = Context.getRepository(SubjectRepository);

    const [school, group] = await Promise.all([
      schoolRepo.find(schoolId),
      groupRepo.find(payload.groupId),
    ]);

    if (!school) {
      throw new Error('School not found');
    }

    if (!group) {
      throw new Error('Group not found');
    }

    const id = SubjectId.create();
    const name = payload.name;
    const requiredTeachers = RequiredTeachers.create(payload.requiredTeachers);
    const recurrence = mapDtoToRecurrence(payload.recurrence);
    const time = TimeInterval.create(payload.time);
    const now = DateTime.now();

    const subject = Subject.create({
      id,
      name,
      school,
      requiredTeachers,
      recurrence,
      time,
      group,
      now,
    });

    subjectRepo.add(subject);

    return new SubjectDto({
      id: subject.id.value,
      name: subject.name,
      recurrence: mapRecurrenceToDto(subject.recurrence),
      time: new TimeIntervalDto(subject.time),
      groupId: subject.groupId.value,
      requiredTeachers: subject.requiredTeachers.value,
      createdAt: subject.createdAt.toISO(),
      updatedAt: subject.updatedAt.toISO(),
    });
  }
}
