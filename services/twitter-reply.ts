/**
 * -= Notes =-
 * Twitter Rate Limiting
 * There is a 300 requests per three hours shared App-level rate limit for the POST 
 * statuses/update (post a Tweet) and POST statuses/retweet/:id (post a Retweet) endpoints.
 */

import { logger } from '../utils/logger'
import Twitter from 'twitter-lite'

const twit = new Twitter({
	consumer_key: process.env.TWITTER_API_KEY!,
	consumer_secret: process.env.TWITTER_API_SECRET!,
	access_token_key: process.env.TWITTER_ACCESS_TOKEN,
	access_token_secret: process.env.TWITTER_ACCESS_SECRET,
})


export const sendSuccessTweetReply = async (tweetId: string, twitterHandle: string) => {
	logger(twitterHandle, tweetId, 'sending reply now...')

	let status = `Your Arweave tokens will be transferred shortly... :-)`

	let tweet = await twit.post('statuses/update', {
		status,
		in_reply_to_status_id: tweetId,
		auto_populate_reply_metadata: true,
	})

	if(tweet.in_reply_to_status_id_str === tweetId){
		logger(twitterHandle, 'success tweet reply sent', tweet.id_str)
		return true
	}
	logger(twitterHandle, 'ERROR, Failed in reply to tweet')
	return false
}

export const sendFailTweetReply = async (tweetId: string, twitterHandle: string) => {
	logger(twitterHandle, tweetId, 'sending reply now...')

	let status = '🤖 Bleep blorp. We can\'t automatically be 100% sure you are human!'
			+ '\n\n If you feel that this is a mistake, please email us at team@arweave.org'

	let tweet = await twit.post('statuses/update', {
		status,
		in_reply_to_status_id: tweetId,
		auto_populate_reply_metadata: true,
	})

	if(tweet.in_reply_to_status_id_str === tweetId){
		logger(twitterHandle, 'fail tweet reply sent', tweet.id_str)
		return true
	}
	logger(twitterHandle, 'ERROR, Failed in reply to tweet')
	return false
}
