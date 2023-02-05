import { Migration } from '@mikro-orm/migrations';

export class Migration20230129143632 extends Migration {
  async up(): Promise<void> {
    const knex = this.ctx || this.getKnex();

    await knex.schema.createTable('lesson', (table) => {
      table.text('id').primary();
      table.text('subject_id');
      table.date('date').notNullable();
      table.text('school_id').notNullable().index();
      table.smallint('time_starts_at').notNullable();
      table.smallint('time_duration').notNullable();
      table.smallint('version').defaultTo(1);
      table.dateTime('created_at', { useTz: false }).notNullable();
      table.dateTime('updated_at', { useTz: false }).notNullable();

      table.unique(['subject_id', 'date']);
    });

    await knex.schema.createTable('lesson_teacher', (table) => {
      table.text('id').primary();
      table.text('lesson_id').notNullable();
      table.text('teacher_id').notNullable();
      table.dateTime('assigned_at', { useTz: false }).notNullable();

      table.unique(['lesson_id', 'teacher_id']);
    });
  }

  override async down(): Promise<void> {
    const knex = this.ctx || this.getKnex();

    await knex.schema.dropTable('lesson');
    await knex.schema.dropTable('lesson_teacher');
  }
}
