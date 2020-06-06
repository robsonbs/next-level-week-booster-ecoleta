import * as Knex from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('points', table => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.string('email').notNullable().unique();
    table.string('whatsapp').nullable();
    table.decimal('latitude', 10, 3).notNullable();
    table.decimal('longitude', 10, 3).notNullable();
    table.string('number').nullable();
    table.string('city').notNullable();
    table.string('uf', 2).notNullable();
    table.string('image').notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTableIfExists('points');
}
