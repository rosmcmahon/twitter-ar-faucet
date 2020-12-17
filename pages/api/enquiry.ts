import type { NextApiRequest, NextApiResponse } from 'next'
import { isProcessed } from '../../services/db-claimed-check'

type ResponseData = {
	processed: boolean
	success: boolean
} | { error: string }

export default async (req: NextApiRequest, res: NextApiResponse<ResponseData>) => {
	const { address } = req.query

	try {
		if(!address || typeof address !== 'string' || address.length !== 43){
			return res.status(400).json({ error: 'invalid parameter' })
		}

		const result = await isProcessed(address)
		
		return res.status(200).json({
			processed: result.exists,
			success: result.approved
		})

	} catch (error) {
		res.status(500).json({ error: 'internal server error'})
	}
}
