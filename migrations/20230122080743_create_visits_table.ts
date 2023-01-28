import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('visits', (table) => {
    table.text('id').primary();
    table.text('name').notNullable();
    table.text('office_id').notNullable().index();
    table.text('periodicity_type').notNullable();
    table.jsonb('periodicity_data').notNullable();
    table.smallint('time_starts_at').notNullable();
    table.smallint('time_duration').notNullable();
    table.text('client_id').notNullable();
    table.smallint('required_employees').notNullable();
    table.smallint('version').notNullable();
    table.dateTime('created_at', { useTz: false }).notNullable();
    table.dateTime('updated_at', { useTz: false }).notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('visits');
}
