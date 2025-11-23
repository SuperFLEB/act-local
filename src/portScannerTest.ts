import ProbingPortScanner from "@/server/lib/Scanner/ProbingPortScanner.ts";
import type {ScannerEvent} from "@/server/lib/Scanner/ScannerEvent.ts";
import type {Service} from "@t/Service.ts";

function outputUpdates(u: ScannerEvent<Service>) {
	switch (u.type) {
		case "ADD":
			console.log("+", u.target.destIp, '| port', u.target.port, '| pid', u.target.pid, '|', u.target.command, '|', u.target.title);
			return;
		case "DELETE":
			console.log("-", u.target.destIp, '| port', u.target.port, '| pid', u.target.pid, '|', u.target.command, '|', u.target.title);
			return;
		case "RESET":
		case "RESET_READY":
			console.log(":", u.type);
			return;
		default:
			console.log("?", u.type);
	}
}

(async () => {
	ProbingPortScanner.create(1000).then((scanner) => {
		console.log("Scanner initialized");
		const listener = (event: ScannerEvent<Service>) => {
			outputUpdates(event);
		};
		scanner.addListener(listener);
		scanner.start();
		console.log("Scanner started");
	});
})();
