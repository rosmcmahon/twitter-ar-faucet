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
import { slackLogger } from '../utils/slack-logger'
import { getTwitterLiteEntry } from '../utils/twitterAuth-twitterLite'

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const sendSuccessTweetReply = async (tweetId: string, twitterHandle: string) => {

	let status = `Your Arweave tokens will be transferred shortly... :-)`

	return sendTweetReply(tweetId, twitterHandle, status, 'success')
}

export const sendFailTweetReply = async (tweetId: string, twitterHandle: string) => {

	let status = '🤖 Bleep blorp. We can\'t automatically be 100% sure you are human!'
			+ '\n\nIf you feel that this is a mistake, please email us at faucet@arweave.org, and paste your 43-character Arweave wallet address and Twitter profile URL in your email.'

	return sendTweetReply(tweetId, twitterHandle, status, 'fail')
}

// export const sendAirdropTweetReply = async (tweetId: string, twitterHandle: string) => {

// 	let status = '🤖 Unfortunately your account is not eligible to receive AR from this faucet.'

// 	return sendTweetReply(tweetId, twitterHandle, status, 'airdrop')
// }

const sendTweetReply = async (tweetId: string, twitterHandle: string, status: string, type: "success" | "fail" | "airdrop") => {
	
	logger(twitterHandle, tweetId, 'sending reply now...')

	const {twit, counterReply} = getTwitterLiteEntry()

	//adding this loop for Twitter connection problems
	const doLoop = async()=>{
		try{
			let tweet = await twit.post('statuses/update', {
				status,
				in_reply_to_status_id: tweetId,
				auto_populate_reply_metadata: true,
			})
	
			counterReply.labels('sent').inc()
			logger(twitterHandle, type + ' tweet reply sent', tweet.id_str)
			return tweet.id_str as string // this is just for unit test
		}catch(e:any) {
			counterReply.labels('error').inc()

			let code = 0
			let message = ''
			if(e.code){
				code = Number(e.code)
				message = e.message
			}else if(e.errors && e.errors[0] && e.errors[0].code){ 
				code = Number(e.errors[0].code)
				message = e.errors[0].message
			}

			if(code === 385){ 
				logger(twitterHandle, code, ':', message)
				return 'user deleted tweet'
			}
			if(code === 433){
				logger(twitterHandle, code, ':', message)
				return 'user restricted replies to tweet'
			}
			if(e.code === 'ECONNRESET'){ 
				logger(twitterHandle,  'Error in reply to tweet =>', e.code + ':' + e.message, 'Retying in 30 seconds...')
				await sleep(30000)
				return 'ECONNRESET'
			}
			
			logger(twitterHandle, 'UNHANDLED Error in reply to tweet =>', e.code + ':' + e.message, 'Full error:\n', JSON.stringify(e))
			slackLogger(twitterHandle, 'UNHANDLED Error in reply to tweet =>', e.code + ':' + e.message)
			return 'error: could not attach reply'
		}
	}

	let response = ''
	do{
		response = await doLoop()
	}while(response === 'ECONNRESET')
	return response;
}

