import type { NextApiRequest, NextApiResponse } from 'next'
import { checkAccountClaim } from '../../services/db-claimed-check'
import { getTweetHandleOrWaitTime } from '../../services/tweet-search'
import { EnquiryData } from '../../types/api-responses'
import { logger } from '../../utils/logger'
import rateLimit from 'express-rate-limit'

const apiLimiter = rateLimit({
	windowMs: 24* 60 * 60 * 1000,
	max: 18,
	message: "Too many requests from your IP.",
	headers: false,
})

// Helper method to wait for a middleware to execute before continuing
// And to throw an error when an error happens in a middleware
function runMiddleware(req: any, res: any, fn: any) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result)
      }

      return resolve(result)
    })
  })
}

export default async (
	request: NextApiRequest, 
	response: NextApiResponse<EnquiryData | { error: string }>
) => {

	const { address } = request.query

	//TODO: blacklist/rate-limit IPs
	logger('API', request.socket.remoteAddress)
	await runMiddleware(request, response, apiLimiter)


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

		const checkHandle = await checkAccountClaim(handleOrWait.handle!, address)
		
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
