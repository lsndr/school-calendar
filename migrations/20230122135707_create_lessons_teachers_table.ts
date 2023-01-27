import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('lessons_teachers', (table) => {
    table.text('subject_id').notNullable();
    table.date('date').notNullable();
    table.text('teacher_id').notNullable();

    table.primary(['subject_id', 'date', 'teacher_id']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('lessons_teachers');
}
