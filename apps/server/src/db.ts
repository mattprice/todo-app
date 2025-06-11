import knex from "knex";
import type { Task } from "../../../shared/typeDefs.ts";
import knexConfig from "../knexfile.ts";

declare module "knex/types/tables.ts" {
  interface Tables {
    tasks: Task;
  }
}

export const db = knex(knexConfig);
