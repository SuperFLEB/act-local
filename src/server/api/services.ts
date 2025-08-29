import type {Request, Response, NextFunction} from "express";
import portScan, {get} from "../lib/portScan";
export default async function services(req: Request, res: Response) {
	const services = await get();
	res.status(200).header("content-type", "application/json").send(JSON.stringify(services));
}