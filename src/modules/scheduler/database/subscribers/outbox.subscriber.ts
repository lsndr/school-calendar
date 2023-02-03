import {
  EntityName,
  EventSubscriber,
  Subscriber,
  TransactionEventArgs,
} from '@mikro-orm/core';
import { Knex } from '@mikro-orm/postgresql';
import { randomUUID } from 'crypto';
import { DateTime } from 'luxon';
import { AggregateRoot } from '../../../shared/domain';
import { Lesson } from '../../domain';

@Subscriber()
export class OutboxSubscriber implements EventSubscriber {
  getSubscribedEntities(): EntityName<any>[] {
    return [Lesson];
  }

  async beforeTransactionCommit(args: TransactionEventArgs) {
    const uow = args.uow;
    const knex: Knex = args.transaction;

    if (!knex || !uow) {
      return;
    }

    const changeSets = uow.getChangeSets();
    const subscribedEntities = this.getSubscribedEntities();

    for (const changeSet of changeSets) {
      const entity = changeSet.entity;

      if (!subscribedEntities.includes(entity.constructor)) {
        continue;
      }

      if (!(entity instanceof AggregateRoot)) {
        continue;
      }

      const rows = [];

      for (const event of entity.events) {
        rows.push({
          id: randomUUID(),
          topic: `scheduler.${event.constructor.name}`,
          payload: event,
          created_at: DateTime.now().toISO(),
        });
      }

      if (rows.length > 0) {
        await knex.insert(rows).into('outbox');
      }
    }
  }
}
