import { NextApiRequest, NextApiResponse } from "next";
import { HeartbeatData } from "../../types/api-responses";
import { getDbHeartbeat } from "../../utils/db-heartbeat";

export default async (req: NextApiRequest, res: NextApiResponse<HeartbeatData | {error: string}>) => {

	try {
		const isOk = await getDbHeartbeat()
		res.status(200).json({
			isOk,
		})
		
	} catch (error) {
		res.status(500).json({ error: 'internal server error'})
	}

}