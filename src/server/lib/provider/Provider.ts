import type {Connection} from "@t/Connection.ts";

type PortScanAbstract<T extends Provider> = {
	new(): T,
	capable(): Promise<boolean>
}

export default abstract class Provider {
	static async create<T extends Provider>(this: PortScanAbstract<T>): Promise<T|null> {
		return await this.capable() ? new this() : null;
	}
	static capable(): Promise<boolean> { return Promise.resolve(false); }
	abstract scan(): Promise<Connection[]>;
}
