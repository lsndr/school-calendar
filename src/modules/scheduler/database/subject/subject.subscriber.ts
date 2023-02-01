import {
  ChangeSetType,
  EventSubscriber,
  Subscriber,
  TransactionEventArgs,
} from '@mikro-orm/core';
import { Knex } from '@mikro-orm/postgresql';
import { RecurrenceType, Subject } from '../../domain';

@Subscriber()
export class SubjectSubscriber implements EventSubscriber {
  getSubscribedEntities() {
    return [Subject];
  }

  async beforeTransactionCommit(args: TransactionEventArgs) {
    const uow = args.uow;
    const knex: Knex = args.transaction;

    if (!knex || !uow) {
      return;
    }

    const changeSets = uow.getChangeSets();

    for (const changeSet of changeSets) {
      const type = changeSet.type;
      const subject = changeSet.entity;

      if (
        ![ChangeSetType.CREATE, ChangeSetType.UPDATE].includes(type) ||
        !(subject instanceof Subject)
      ) {
        continue;
      }

      const data: Record<any, any> = {
        subject_id: subject.id.value,
        name: subject.name,
        recurrence_type: subject.recurrence.type,
        recurrence_days: null,
        recurrence_week1: null,
        recurrence_week2: null,
        time_starts_at: subject.time.startsAt,
        time_duration: subject.time.duration,
        required_teachers: subject.requiredTeachers.value,
        created_at: subject.updatedAt.toUTC().toSQL(),
      };

      if (
        subject.recurrence.type === RecurrenceType.Weekly ||
        subject.recurrence.type === RecurrenceType.Monthly
      ) {
        data['recurrence_days'] = subject.recurrence.days;
      } else if (subject.recurrence.type === RecurrenceType.BiWeekly) {
        data['recurrence_week1'] = subject.recurrence.week1;
        data['recurrence_week2'] = subject.recurrence.week2;
      }

      await knex.insert(data).into('subject_log');
    }
  }
}
