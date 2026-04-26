export async function getJsonBody(req, res) {
	let body = "";

	for await (const chunk of req) {
		body += chunk.toString();
	}

	if (!body) {
		return {};
	}

	try {
		return JSON.parse(body);
	} catch {
		res.setHeader("Content-Type", "application/json");
		res.statusCode = 400;
		res.end(JSON.stringify({ error: "Invalid JSON body" }));
		return null;
	}
}
