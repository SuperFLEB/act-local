import ProbingPortScanner from "@/server/lib/Scanner/ProbingPortScanner.ts";
import type {ScannerEvent} from "@/server/lib/Scanner/ScannerEvent.ts";
import type {Service} from "@t/Service.ts";

function logUpdate(u: ScannerEvent<Service>) {
	const symbol = ({
		ADD: "+",
		DELETE: "-",
	})[u.type as string] ?? ":";

	switch (u.type) {
		case "ADD":
		case "DELETE":
			console.log(symbol, u.target.id, "| dest", u.target.destIp, '| port', u.target.port, '| pid', u.target.pid, '|', u.target.command, '|', u.target.title);
			return;
		case "RESET":
		case "RESET_READY":
			console.log(":", u.type);
			return;
		case "INFO":
		case "ERROR":
			console.log(":", u.type, "|", u.info);
			return;
		default:
			console.log("?", u.type, u.info);
	}
}

(async () => {
	ProbingPortScanner.create(1000).then((scanner) => {
		console.log("Scanner initialized");
		const listener = (event: ScannerEvent<Service>) => {
			logUpdate(event);
		};
		scanner.addListener(listener);
		scanner.start();
		console.log("Scanner started");
	});
})();
