import type { NextApiRequest, NextApiResponse } from 'next'
import { checkHandleClaim, isProcessed } from '../../services/db-claimed-check'
import { getTweetHandleOrWaitTime } from '../../services/tweet-search'
import { EnquiryData } from '../../types/api-responses'
import { logger } from '../../utils/logger'



export default async (
	request: NextApiRequest, 
	response: NextApiResponse<EnquiryData | { error: string }>
) => {
	const { address } = request.query

	//TODO: blacklist/rate-limit IPs
	console.log('API:remoteAddress', request.socket.remoteAddress)
  console.log('API:address()', request.socket.address())

	try {
		if(!address || typeof address !== 'string' || address.length !== 43){
			return response.status(400).json({ error: 'invalid parameter' })
		}

		/**
		 * STEPS:
		 * - getTweetHandleOrWaitTime -- optionally return wait time 
		 * - handleClaimed - optionally return failed
		 * - isProcessed - final result
		 */

		const handleOrWait = await getTweetHandleOrWaitTime(address)

		logger('API', handleOrWait)

		if(handleOrWait.value === false){
			return response.status(200).json({
				processed: false,
				approved: false,
				waitTime: handleOrWait.rateLimitReset,
				alreadyClaimed: false,
			})
		}


		const checkHandle = await checkHandleClaim(handleOrWait.handle!, address)
		
		logger('API', checkHandle)

		if(checkHandle.exists){
			return response.status(200).json({
				processed: true,
				approved: false,
				waitTime: 0,
				alreadyClaimed: true,
				handle: handleOrWait.handle!,
			})
		}

		const result = await isProcessed(address)
		
		logger('API', result)

		return response.status(200).json({
			processed: result.exists,
			approved: result.approved,
			waitTime: 0,
			alreadyClaimed: false,
			handle: handleOrWait.handle!,
		})

	} catch (error) {
		response.status(500).json({ error: 'internal server error'})
	}
}
