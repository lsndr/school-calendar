import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('lessons', (table) => {
    table.text('subject_id');
    table.text('school_id').notNullable().index();
    table.date('date').notNullable();
    table.smallint('time_starts_at').notNullable();
    table.smallint('time_duration').notNullable();
    table.smallint('version').notNullable();
    table.dateTime('created_at', { useTz: false }).notNullable();
    table.dateTime('updated_at', { useTz: false }).notNullable();

    table.primary(['subject_id', 'date']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('lessons');
}
