import http from "node:http";
import { db, runDb } from "./database.js";
import { getJsonBody } from "./utils.js";

runDb();

const server = http.createServer(async (req, res) => {
	if (req.url === "/api/tasks" && req.method === "GET") {
		res.setHeader("Content-Type", "application/json");
		const tasks = (await db.query("SELECT * FROM tasks")).rows;
		return res.end(JSON.stringify({ data: tasks }));
	}

	if (req.url === "/api/tasks" && req.method === "POST") {
		const { title, description } = await getJsonBody(req, res);

		if (!title) {
			res.setHeader("Content-Type", "application/json");
			res.statusCode = 400;
			return res.end(JSON.stringify({ error: "title is required." }));
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
	}

	res.setHeader("Content-Type", "application/json");
	res.statusCode = 404;
	return res.end(
		JSON.stringify({ error: `Cannot ${req.method} ${req.url}` }),
	);
});

server.listen(3000, () => console.log("Server is running..."));
