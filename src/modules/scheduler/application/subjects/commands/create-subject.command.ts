import { MikroORM } from '@mikro-orm/postgresql';
import { Command, CommandHandler, CommandProps } from '@shared/cqrs';
import {
  Group,
  RequiredTeachers,
  School,
  Subject,
  SubjectId,
  TimeInterval,
} from '../../../domain';
import { DateTime } from 'luxon';
import { CreateSubjectDto } from '../dtos/create-subject.dto';
import { SubjectDto } from '../dtos/subject.dto';
import { mapDtoToRecurrence, mapRecurrenceToDto } from '../helpers/mappers';
import { TimeIntervalDto } from '../../shared';

export class CreateSubjectCommand extends Command<SubjectDto> {
  public readonly schoolId: string;
  public readonly payload: CreateSubjectDto;

  constructor(props: CommandProps<CreateSubjectCommand>) {
    super();

    this.schoolId = props.schoolId;
    this.payload = props.payload;
  }
}

@CommandHandler(CreateSubjectCommand)
export class CreateSubjectCommandHandler
  implements CommandHandler<CreateSubjectCommand>
{
  constructor(private readonly orm: MikroORM) {}

  async execute({ schoolId, payload }: CreateSubjectCommand) {
    const em = this.orm.em.fork();
    const groupRepository = em.getRepository(Group);
    const schoolRepository = em.getRepository(School);
    const subjectRepository = em.getRepository(Subject);

    const [school, group] = await Promise.all([
      schoolRepository
        .createQueryBuilder()
        .where({
          id: schoolId,
        })
        .getSingleResult(),

      groupRepository
        .createQueryBuilder()
        .where({
          id: payload.groupId,
        })
        .getSingleResult(),
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

    await subjectRepository.persistAndFlush(subject);

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
