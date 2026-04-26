import { PGlite } from "@electric-sql/pglite";
import fs from "fs";

export const db = new PGlite("./db");

export async function runDb() {
	await db.exec(`
        CREATE TABLE IF NOT EXISTS tasks (
            id SERIAL PRIMARY KEY,
            title TEXT,
            description TEXT,
            done BOOLEAN
        );

        INSERT INTO tasks (title, description, done)
        SELECT 'Teste', 'Teste', true
        WHERE NOT EXISTS (SELECT 1 FROM tasks LIMIT 1);
`);
}
