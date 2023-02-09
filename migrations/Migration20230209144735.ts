import { Migration } from '@mikro-orm/migrations';

export class Migration20230209144735 extends Migration {
  async up(): Promise<void> {
    const knex = this.ctx || this.getKnex();

    return knex.schema.alterTable('attendance_employee', (table) => {
      table.setNullable('attendance_id');
    });
  }

  override async down(): Promise<void> {
    const knex = this.ctx || this.getKnex();

    return knex.schema.alterTable('attendance_employee', (table) => {
      table.dropNullable('attendance_id');
    });
  }
}
