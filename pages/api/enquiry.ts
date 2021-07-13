import type { NextApiRequest, NextApiResponse } from 'next'
import { checkAccountClaim } from '../../services/db-claimed-check'
import { getTweetHandleOrWaitTime } from '../../services/tweet-search'
import { EnquiryData } from '../../types/api-responses'
import { logger } from '../../utils/logger'
import expressRateLimit from 'express-rate-limit'
import { getRateLimitWait } from '../../utils/ratelimit-singletons'

const apiLimiter = expressRateLimit({
	windowMs: 15 * 60 * 1000,
	max: 18,
	message: "Sorry, you have made too many requests. Please come back later if you have not already claimed.",
	headers: false,
})

// Helper method to wait for a middleware to execute before continuing
function runMiddleware(req: NextApiRequest, res: any, fn: any) {
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
	const timerRl = setTimeout(()=>{
		logger(address, 'API: our API rate-limit was breached for', request.socket.remoteAddress)
	}, 60000)
	await runMiddleware(request, response, apiLimiter)
	clearTimeout(timerRl)

	try {
		if(!address || typeof address !== 'string' || address.length !== 43){
			return response.status(400).json({ error: 'invalid parameter' })
		}

		logger(address, 'API was called from', request.socket.remoteAddress)

		/* Step 1. Check for rate-limiting */

		const rateLimit = getRateLimitWait()

		if(rateLimit > 0){

			logger(address,'**(API: Twitter RateLimit applied)**', rateLimit + ' ms')
			
			return response.status(200).json({
				processed: false,
				approved: false,
				rateLimitWait: rateLimit, // caller handle rate-limiting
				alreadyClaimed: false,
			})
		}

		/* Step 2. Check the address against the DB and return the results */
		
		const accountOrWait = await getTweetHandleOrWaitTime(address)

		if(accountOrWait.value === false){
			return response.status(200).json({
				processed: false,
				approved: false,
				rateLimitWait: rateLimit,
				alreadyClaimed: false,
			})
		}

		const checkAccountId = await checkAccountClaim(accountOrWait.twitterId!, address)
		
		logger(address, 'API2', JSON.stringify(checkAccountId))

		if(checkAccountId.exists){
			return response.status(200).json({
				processed: true,
				approved: checkAccountId.approved,
				rateLimitWait: 0,
				alreadyClaimed: checkAccountId.alreadyClaimed,
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
