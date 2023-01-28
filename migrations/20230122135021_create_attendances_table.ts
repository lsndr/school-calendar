import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('attendances', (table) => {
    table.text('visit_id');
    table.text('office_id').notNullable().index();
    table.date('date').notNullable();
    table.smallint('time_starts_at').notNullable();
    table.smallint('time_duration').notNullable();
    table.smallint('version').notNullable();
    table.dateTime('created_at', { useTz: false }).notNullable();
    table.dateTime('updated_at', { useTz: false }).notNullable();

    table.primary(['visit_id', 'date']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('attendances');
}
