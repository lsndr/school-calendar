import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('attendances_employees', (table) => {
    table.text('visit_id').notNullable();
    table.date('date').notNullable();
    table.text('employee_id').notNullable();

    table.primary(['visit_id', 'date', 'employee_id']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('attendances_employees');
}
