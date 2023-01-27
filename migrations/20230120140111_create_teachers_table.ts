import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('teachers', (table) => {
    table.text('id').primary();
    table.text('name').notNullable();
    table.text('school_id').notNullable().index();
    table.smallint('version').notNullable();
    table.dateTime('created_at', { useTz: false }).notNullable();
    table.dateTime('updated_at', { useTz: false }).notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('teachers');
}
