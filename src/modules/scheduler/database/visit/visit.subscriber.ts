import {
  ChangeSetType,
  EventSubscriber,
  Subscriber,
  TransactionEventArgs,
} from '@mikro-orm/core';
import { Knex } from '@mikro-orm/postgresql';
import { RecurrenceType, Visit } from '../../domain';

@Subscriber()
export class VisitSubscriber implements EventSubscriber {
  getSubscribedEntities() {
    return [Visit];
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
      const visit = changeSet.entity;

      if (
        ![ChangeSetType.CREATE, ChangeSetType.UPDATE].includes(type) ||
        !(visit instanceof Visit)
      ) {
        continue;
      }

      const data: Record<any, any> = {
        visit_id: visit.id.value,
        name: visit.name,
        recurrence_type: visit.recurrence.type,
        recurrence_days: null,
        recurrence_week1: null,
        recurrence_week2: null,
        time_starts_at: visit.time.startsAt,
        time_duration: visit.time.duration,
        required_employees: visit.requiredEmployees.value,
        created_at: visit.updatedAt.toUTC().toSQL(),
      };

      if (
        visit.recurrence.type === RecurrenceType.Weekly ||
        visit.recurrence.type === RecurrenceType.Monthly
      ) {
        data['recurrence_days'] = visit.recurrence.days;
      } else if (visit.recurrence.type === RecurrenceType.BiWeekly) {
        data['recurrence_week1'] = visit.recurrence.week1;
        data['recurrence_week2'] = visit.recurrence.week2;
      }

      await knex.insert(data).into('visit_log');
    }
  }
}
