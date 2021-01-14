import type { NextApiRequest, NextApiResponse } from 'next'
import { checkHandleClaim } from '../../services/db-claimed-check'
import { getTweetHandleOrWaitTime } from '../../services/tweet-search'
import { EnquiryData } from '../../types/api-responses'
import { logger } from '../../utils/logger'



export default async (
	request: NextApiRequest, 
	response: NextApiResponse<EnquiryData | { error: string }>
) => {
	const { address } = request.query

	//TODO: blacklist/rate-limit IPs
	logger('API', request.socket.remoteAddress)

	try {
		if(!address || typeof address !== 'string' || address.length !== 43){
			return response.status(400).json({ error: 'invalid parameter' })
		}

		/* Step 1. Check the tweet has been posted & get the twitter handle */

		const handleOrWait = await getTweetHandleOrWaitTime(address)

		logger('API', handleOrWait)

		if(handleOrWait.value === false){
			return response.status(200).json({
				processed: false,
				approved: false,
				rateLimitWait: handleOrWait.rateLimitReset, // handle rate-limiting
				alreadyClaimed: false,
			})
		}

		/* Step 2. Check the handle against the DB and return the results */

		const checkHandle = await checkHandleClaim(handleOrWait.handle!, address)
		
		logger('API', checkHandle)

		if(checkHandle.exists){
			return response.status(200).json({
				processed: true,
				approved: checkHandle.approved,
				rateLimitWait: 0,
				alreadyClaimed: checkHandle.alreadyClaimed,
				handle: handleOrWait.handle!,
			})
		} else {
			return response.status(200).json({
				processed: false,
				approved: false,
				rateLimitWait: 0,
				alreadyClaimed: false,
			})
		}

	} catch (error) {
		response.status(500).json({ error: 'internal server error'})
	}
}
