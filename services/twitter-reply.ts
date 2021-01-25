/**
 * -= Notes =-
 * Twitter Direct Message Rate Limiting
 * Requests / 24-hour window:  15000 per app
 * 
 */

import { logger } from '../utils/logger'
import Twitter from 'twitter-lite'

const twit = new Twitter({
	consumer_key: process.env.TWITTER_API_KEY!,
	consumer_secret: process.env.TWITTER_API_SECRET!,
	access_token_key: process.env.TWITTER_ACCESS_TOKEN,
	access_token_secret: process.env.TWITTER_ACCESS_SECRET,
})


export const sendTwitterReply = async (tweetId: string, twitterHandle: string) => {
	logger(twitterHandle, tweetId, 'sending reply now...')

	let status = `Your Arweave tokens will be transferred shortly... :-)`

	let tweet = await twit.post('statuses/update', {
		status,
		in_reply_to_status_id: tweetId,
		auto_populate_reply_metadata: true,
	})

	if(tweet.in_reply_to_status_id_str === tweetId){
		logger(twitterHandle, 'successfully replied to tweet')
		return true
	}
	logger(twitterHandle, 'ERROR, Failed in reply to tweet')
	return false
}
