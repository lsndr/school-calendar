import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('subjects_log', (table) => {
    table.text('subject_id').notNullable().index();
    table.text('name').notNullable();
    table.text('periodicity_type').notNullable();
    table.jsonb('periodicity_data').notNullable();
    table.smallint('starts_at').notNullable();
    table.smallint('duration').notNullable();
    table.smallint('required_teachers').notNullable();
    table.dateTime('created_at', { useTz: false }).notNullable();

    table.primary(['subject_id', 'created_at']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('subjects_log');
}
