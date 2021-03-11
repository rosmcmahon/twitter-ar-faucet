/**
 * -= Notes =-
 * Twitter Rate Limiting
 * There is a 300 requests per three hours shared App-level rate limit for the POST 
 * statuses/update (post a Tweet) and POST statuses/retweet/:id (post a Retweet) endpoints.
 * 
 * N.B. Status of POST 'statuses/update' is not available from 'application/rate_limit_status'
 * So we have to monitor ourselves.
 */

import { logger } from '../utils/logger'
import Twitter from 'twitter-lite'
import { metricPrefix } from '../utils/constants'
import { Counter, register } from 'prom-client'

const twit = new Twitter({
	consumer_key: process.env.TWITTER_API_KEY!,
	consumer_secret: process.env.TWITTER_API_SECRET!,
	access_token_key: process.env.TWITTER_ACCESS_TOKEN,
	access_token_secret: process.env.TWITTER_ACCESS_SECRET,
})


const ctrReplyName = metricPrefix + 'twit_reply_counter'
let ctrReply = register.getSingleMetric(ctrReplyName) as Counter<'reply'>
if(!ctrReply){
		ctrReply = new Counter({
		name: ctrReplyName,
		help: ctrReplyName + '_help',
		aggregator: 'sum',
		labelNames: ['reply'],
	})
	ctrReply.labels('limit3hr').inc(300)
}


export const sendSuccessTweetReply = async (tweetId: string, twitterHandle: string) => {

	let status = `Your Arweave tokens will be transferred shortly... :-)`

	return sendTweetReply(tweetId, twitterHandle, status, 'success')
}

export const sendFailTweetReply = async (tweetId: string, twitterHandle: string) => {

	let status = '🤖 Bleep blorp. We can\'t automatically be 100% sure you are human!'
			+ '\n\nIf you feel that this is a mistake, please email us at team@arweave.org, and paste your 43-character Arweave wallet address and Twitter profile URL in your email.'

	return sendTweetReply(tweetId, twitterHandle, status, 'fail')
}

const sendTweetReply = async (tweetId: string, twitterHandle: string, status: string, type: "success" | "fail") => {
	
	logger(twitterHandle, tweetId, 'sending reply now...')

	try{
		let tweet = await twit.post('statuses/update', {
			status,
			in_reply_to_status_id: tweetId,
			auto_populate_reply_metadata: true,
		})

		ctrReply.labels('success').inc()
		logger(twitterHandle, type + ' tweet reply sent', tweet.id_str)
		return tweet.id_str as string
	}catch(e) {
		// /* This status code has recently been removed from the Twitter API */
		// if(e.code === 385){ 
		// 	logger(twitterHandle, 'Error 385: user deleted their tweet before our reply was attached')
		// 	return 'user deleted tweet'
		// }
		ctrReply.labels('failed').inc()
		logger(twitterHandle, 'Error in reply to tweet =>', e.code + ':' + e.message)
		return 'error: could not attach reply'
	}
}

