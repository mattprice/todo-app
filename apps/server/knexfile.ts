import type { Knex } from "knex";

const config: Knex.Config = {
  client: "better-sqlite3",
  connection: {
    filename: "./db.sqlite3",
  },
  useNullAsDefault: true,
};

export default config;
