import { Migration } from '@mikro-orm/migrations';

export class Migration20230129143632 extends Migration {
  async up(): Promise<void> {
    const knex = this.getKnex();

    await knex.schema.createTable('attendance', (table) => {
      table.text('id').primary();
      table.text('visit_id');
      table.date('date').notNullable();
      table.text('office_id').notNullable().index();
      table.smallint('time_starts_at').notNullable();
      table.smallint('time_duration').notNullable();
      table.smallint('version').defaultTo(1);
      table.dateTime('created_at', { useTz: false }).notNullable();
      table.dateTime('updated_at', { useTz: false }).notNullable();

      table.unique(['visit_id', 'date']);
    });

    await knex.schema.createTable('attendance_employee', (table) => {
      table.text('id').primary();
      table.text('attendance_id').notNullable();
      table.text('employee_id').notNullable();
      table.dateTime('assigned_at', { useTz: false }).notNullable();

      table.unique(['attendance_id', 'employee_id']);
    });
  }

  override async down(): Promise<void> {
    const knex = this.getKnex();

    await knex.schema.dropTable('attendance');
    await knex.schema.dropTable('attendance_employee');
  }
}
