import { Migration } from '@mikro-orm/migrations';

export class Migration20230209144735 extends Migration {
  async up(): Promise<void> {
    const knex = this.ctx || this.getKnex();

    return knex.schema.alterTable('lesson_teacher', (table) => {
      table.setNullable('lesson_id');
    });
  }

  override async down(): Promise<void> {
    const knex = this.ctx || this.getKnex();

    return knex.schema.alterTable('lesson_teacher', (table) => {
      table.dropNullable('lesson_id');
    });
  }
}
