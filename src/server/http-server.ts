import express from "express";
import services from "./api/services";
import {access, constants as fsConstants} from "node:fs";
import type {ServerInfo} from "@t/ServerInfo.ts";

const APP_NAME = "Act Local";

export default function serveHttp(port: number, options: ServerInfo) {
	const app = express();

	app.get("/services", services);
	app.get("/serverinfo.json", (req, res) => {
		res.status(200).contentType("application/json").send(JSON.stringify(options));
	});
	app.get("/", (req, res) => {
		access(__dirname + "/index.html", fsConstants.R_OK, (err) => {
			if (err) {
				res.send(HOME);
				return;
			}
			res.sendFile(__dirname + "/index.html");
		});
	});
	app.get("/favicon.ico", (req, res) => res.sendFile(__dirname + "/logo.svg"));
	app.get("/server.js", (req, res) => {
		res.status(403).send("Nice try, but no.");
	});

	// This MUST remain after other routes.
	app.use(express.static(__dirname + "/"));

	app.listen(port, () => {
		console.log(`HTTP server ready on port ${port}`);
	});
}

const HOME = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${APP_NAME} (API Server)</title>
</head>
<body>
    This is the ${APP_NAME} API server fallback page. You should only see this when the server is in development mode.
</body>
</html>
`;
