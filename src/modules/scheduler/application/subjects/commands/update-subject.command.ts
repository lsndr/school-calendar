import { MikroORM } from '@mikro-orm/postgresql';
import { Command, CommandHandler, CommandProps } from '@shared/cqrs';
import { RequiredTeachers, Subject, TimeInterval } from '../../../domain';
import { DateTime } from 'luxon';
import { SubjectDto } from '../dtos/subject.dto';
import { mapDtoToRecurrence, mapRecurrenceToDto } from '../helpers/mappers';
import { UpdateSubjectDto } from '../dtos/update-subject.dto';
import { TimeIntervalDto } from '../../shared';

export class UpdateSubjectCommand extends Command<SubjectDto | undefined> {
  public readonly id: string;
  public readonly schoolId: string;
  public readonly payload: UpdateSubjectDto;

  constructor(props: CommandProps<UpdateSubjectCommand>) {
    super();

    this.id = props.id;
    this.schoolId = props.schoolId;
    this.payload = props.payload;
  }
}

@CommandHandler(UpdateSubjectCommand)
export class UpdateSubjectCommandHandler
  implements CommandHandler<UpdateSubjectCommand>
{
  constructor(private readonly orm: MikroORM) {}

  async execute({ id, schoolId, payload }: UpdateSubjectCommand) {
    const em = this.orm.em.fork();
    const subjectRepository = em.getRepository(Subject);
    const now = DateTime.now();

    const subject = await subjectRepository
      .createQueryBuilder()
      .where({
        id,
        school_id: schoolId,
      })
      .getSingleResult();

    if (!subject) {
      return;
    }

    if (typeof payload.name !== 'undefined') {
      subject.setName(payload.name, now);
    }

    if (typeof payload.recurrence !== 'undefined') {
      subject.setRecurrence(mapDtoToRecurrence(payload.recurrence), now);
    }

    if (typeof payload.requiredTeachers !== 'undefined') {
      subject.setRequiredTeachers(
        RequiredTeachers.create(payload.requiredTeachers),
        now,
      );
    }

    if (typeof payload.time !== 'undefined') {
      subject.setTime(TimeInterval.create(payload.time), now);
    }

    await em.flush();

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
