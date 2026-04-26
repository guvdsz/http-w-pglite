import http from "node:http";
import { db, runDb } from "./database.js";
import { getJsonBody, getPathParams, sendJson } from "./utils.js";

await runDb();

const server = http.createServer(async (req, res) => {
	const url = req.url ?? "/";
	const method = req.method ?? "GET";

	if (url === "/api/tasks" && method === "GET") {
		try {
			const tasks = (await db.query("SELECT * FROM tasks")).rows;
			return sendJson(200, res, { data: tasks });
		} catch {
			return sendJson(500, res, { error: "Internal server error." });
		}
	}

	if (url.startsWith("/api/tasks/") && method === "PUT") {
		try {
			const { title, description, done } = await getJsonBody(req);

			const taskId = Number(getPathParams(req)) || null;

			if (!taskId) {
				return sendJson(400, res, {
					error: "taskId is required.",
				});
			}

			if (typeof done !== "boolean") {
				return sendJson(400, res, {
					error: "done must be a boolean.",
				});
			}

			if (!title) {
				return sendJson(400, res, {
					error: "title is required.",
				});
			}

			if (!description) {
				return sendJson(400, res, {
					error: "description is required.",
				});
			}

			const task = await db.query(
				"SELECT * FROM tasks WHERE id = $1",
				[taskId],
			);

			if (task.rows.length === 0) {
				return sendJson(404, res, {
					error: "Task not found.",
				});
			}

			const updatedTask = await db.query(
				"UPDATE tasks SET title = $1, description = $2, done = $3 WHERE id = $4 RETURNING *",
				[title, description, done, taskId],
			);

			return sendJson(200, res, { data: updatedTask.rows[0] });
		} catch {
			return sendJson(500, res, { error: "Internal server error." });
		}
	}

	if (url.startsWith("/api/tasks/") && method === "DELETE") {
		try {
			const taskId = Number(getPathParams(req)) || null;

			if (!taskId) {
				return sendJson(400, res, {
					error: "taskId is required.",
				});
			}

			const task = await db.query(
				"SELECT * FROM tasks WHERE id = $1",
				[taskId],
			);

			if (task.rows.length === 0) {
				return sendJson(404, res, {
					error: "Task not found.",
				});
			}

			await db.query("DELETE FROM tasks WHERE id = $1", [taskId]);

			return sendJson(200, res, {
				message: "Task deleted successfully.",
			});
		} catch {
			return sendJson(500, res, { error: "Internal server error." });
		}
	}

	if (url.startsWith("/api/tasks/") && method === "GET") {
		try {
			const taskId = Number(getPathParams(req)) || null;

			if (!taskId) {
				return sendJson(400, res, {
					error: "taskId is required.",
				});
			}

			const task = await db.query(
				"SELECT * FROM tasks WHERE id = $1",
				[taskId],
			);

			if (task.rows.length === 0) {
				return sendJson(404, res, {
					error: "Task not found.",
				});
			}
			return sendJson(200, res, { data: task.rows[0] });
		} catch {
			return sendJson(500, res, { error: "Internal server error." });
		}
	}

	if (url === "/api/tasks" && method === "POST") {
		try {
			const { title, description } = await getJsonBody(req, res);

			if (!title) {
				return sendJson(400, res, {
					error: "title is required.",
				});
			}

			if (!description) {
				return sendJson(400, res, {
					error: "description is required.",
				});
			}

			const createdTask = await db.query(
				"INSERT INTO tasks (title, description) VALUES ($1, $2) RETURNING *",
				[title, description],
			);

			return sendJson(201, res, { data: createdTask.rows[0] });
		} catch {
			return sendJson(500, res, { error: "Internal server error." });
		}
	}

	return sendJson(404, res, { error: `Cannot ${method} ${url}` });
});

server.listen(3000, () => console.log("Server is running..."));
