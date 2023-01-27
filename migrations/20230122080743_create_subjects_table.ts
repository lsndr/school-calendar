import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('subjects', (table) => {
    table.text('id').primary();
    table.text('name').notNullable();
    table.text('school_id').notNullable().index();
    table.text('periodicity_type').notNullable();
    table.jsonb('periodicity_data').notNullable();
    table.smallint('starts_at').notNullable();
    table.smallint('duration').notNullable();
    table.text('group_id').notNullable();
    table.smallint('required_teachers').notNullable();
    table.smallint('version').notNullable();
    table.dateTime('created_at', { useTz: false }).notNullable();
    table.dateTime('updated_at', { useTz: false }).notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('subjects');
}
