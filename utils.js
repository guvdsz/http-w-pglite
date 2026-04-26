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
		sendJson(400, res, { error: "Invalid JSON body" });
	}
}

export function sendJson(status, res, data) {
	res.statusCode = status;
	res.setHeader("Content-Type", "application/json");
	return res.end(JSON.stringify(data));
}

export function getPathParams(req) {
	const param = req?.url?.split("/")?.pop() || null;

	return param;
}
