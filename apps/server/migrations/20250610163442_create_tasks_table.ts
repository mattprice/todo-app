import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("tasks", (table) => {
    table.uuid("id").primary();
    table.string("title").notNullable();
    table.boolean("completed").notNullable().defaultTo(false);
    table.integer("priority").notNullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("tasks");
}
