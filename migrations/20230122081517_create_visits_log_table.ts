import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('visits_log', (table) => {
    table.text('visit_id').notNullable().index();
    table.text('name').notNullable();
    table.text('periodicity_type').notNullable();
    table.jsonb('periodicity_data').notNullable();
    table.smallint('time_starts_at').notNullable();
    table.smallint('time_duration').notNullable();
    table.smallint('required_employees').notNullable();
    table.dateTime('created_at', { useTz: false }).notNullable();

    table.primary(['visit_id', 'created_at']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('visits_log');
}
