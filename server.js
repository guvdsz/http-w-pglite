import http from "node:http";
import { db, runDb } from "./database.js";
import { getJsonBody, getQueryParams } from "./utils.js";

runDb();

const server = http.createServer(async (req, res) => {
	if (req.url === "/api/tasks" && req.method === "GET") {
		try {
			res.setHeader("Content-Type", "application/json");
			const tasks = (await db.query("SELECT * FROM tasks")).rows;
			return res.end(JSON.stringify({ data: tasks }));
		} catch {
			res.setHeader("Content-Type", "application/json");
			res.statusCode = 500;
			return res.end(
				JSON.stringify({ error: "Internal server error." }),
			);
		}
	}

	if (req.url.startsWith("/api/tasks") && req.method === "PUT") {
		try {
			const { title, description } = await getJsonBody(req, res);

			const { taskId } = await getQueryParams(req, res);

			if (!title) {
				res.setHeader("Content-Type", "application/json");
				res.statusCode = 400;
				return res.end(
					JSON.stringify({ error: "title is required." }),
				);
			}

			if (!description) {
				res.setHeader("Content-Type", "application/json");
				res.statusCode = 400;
				return res.end(
					JSON.stringify({ error: "description is required." }),
				);
			}

			if (!taskId) {
				res.setHeader("Content-Type", "application/json");
				res.statusCode = 400;
				return res.end(
					JSON.stringify({ error: "taskId is required." }),
				);
			}

			res.setHeader("Content-Type", "application/json");

			const task = await db.query(
				"SELECT * FROM tasks WHERE id = $1",
				[taskId],
			);

			if (task.rows.length === 0) {
				res.setHeader("Content-Type", "application/json");
				res.statusCode = 404;
				return res.end(
					JSON.stringify({ error: "Task not found." }),
				);
			}

			const updatedTask = await db.query(
				"UPDATE tasks SET title = $1, description = $2 WHERE id = $3 RETURNING *",
				[title, description, taskId],
			);

			return res.end(JSON.stringify({ data: updatedTask.rows[0] }));
		} catch {
			res.setHeader("Content-Type", "application/json");
			res.statusCode = 500;
			return res.end(
				JSON.stringify({ error: "Internal server error." }),
			);
		}
	}

	if (req.url === "/api/tasks" && req.method === "POST") {
		try {
			const { title, description } = await getJsonBody(req, res);

			if (!title) {
				res.setHeader("Content-Type", "application/json");
				res.statusCode = 400;
				return res.end(
					JSON.stringify({ error: "title is required." }),
				);
			}

			if (!description) {
				res.setHeader("Content-Type", "application/json");
				res.statusCode = 400;
				return res.end(
					JSON.stringify({ error: "description is required." }),
				);
			}

			res.setHeader("Content-Type", "application/json");
			await db.query(
				"INSERT INTO tasks (title, description) VALUES ($1, $2)",
				[title, description],
			);

			const tasks = (await db.query("SELECT * FROM tasks")).rows;

			return res.end(JSON.stringify({ data: tasks }));
		} catch {
			res.setHeader("Content-Type", "application/json");
			res.statusCode = 500;
			return res.end(
				JSON.stringify({ error: "Internal server error." }),
			);
		}
	}

	res.setHeader("Content-Type", "application/json");
	res.statusCode = 404;
	return res.end(
		JSON.stringify({ error: `Cannot ${req.method} ${req.url}` }),
	);
});

server.listen(3000, () => console.log("Server is running..."));
