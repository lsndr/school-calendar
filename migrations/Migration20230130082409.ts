import { Migration } from '@mikro-orm/migrations';

export class Migration20230130082409 extends Migration {
  async up(): Promise<void> {
    const knex = this.getKnex();

    await knex.schema.createTable('subject', (table) => {
      table.text('id').primary();
      table.text('name').notNullable();
      table.text('school_id').notNullable().index();
      table.text('recurrence_type').notNullable();
      table.specificType('recurrence_days', 'smallint[]');
      table.specificType('recurrence_week1', 'smallint[]');
      table.specificType('recurrence_week2', 'smallint[]');
      table.smallint('time_starts_at').notNullable();
      table.smallint('time_duration').notNullable();
      table.text('group_id').notNullable();
      table.smallint('required_teachers').notNullable();
      table.smallint('version').notNullable().defaultTo(1);
      table.dateTime('created_at', { useTz: false }).notNullable();
      table.dateTime('updated_at', { useTz: false }).notNullable();
    });

    await knex.schema.createTable('subject_log', (table) => {
      table.text('subject_id').notNullable().index();
      table.text('name').notNullable();
      table.text('recurrence_type').notNullable();
      table.specificType('recurrence_days', 'smallint[]');
      table.specificType('recurrence_week1', 'smallint[]');
      table.specificType('recurrence_week2', 'smallint[]');
      table.smallint('time_starts_at').notNullable();
      table.smallint('time_duration').notNullable();
      table.smallint('required_teachers').notNullable();
      table.dateTime('created_at', { useTz: false }).notNullable();

      table.primary(['subject_id', 'created_at']);
    });
  }

  override async down(): Promise<void> {
    const knex = this.getKnex();

    await knex.schema.dropTable('subject');
    await knex.schema.dropTable('subject_log');
  }
}
