import { IncomingWebhook } from '@slack/webhook'
import { EOL } from 'os'
import { BotCheckResult } from '../services/bot-check'
import { logger } from './logger'

const webhook = new IncomingWebhook(process.env.SLACK_WEBHOOK!)

/**
 * Removing this logging for now, as Sophie does not use it much, and I want the channel for important alerts only.
 * Perhaps this data should be outputted to simple csv file instead?
 */
const logToSlack = async (handle: string, twitterId: string, address: string, botresult: BotCheckResult, tweetId?: string) => {

	if(process.env.NODE_ENV !== 'production') return

	try{
		let text = ''
			+ `DisplayName: <https://twitter.com/${handle}|${handle}>` + EOL
			+ `TwitterID: \`${twitterId}\`` + EOL
			+ `Claim Address: <https://viewblock.io/arweave/address/${address}|${address}>` + EOL
			+ `Bot-Score: \`${botresult.botScore}\`` + EOL
			+ `Successful: \`${botresult.passed}\`` + EOL
			+ `Reason: \`${botresult.reason}\`` + EOL
		if(tweetId){
			text += 'Tweet Reply: ' + `<https://twitter.com/ArweaveW/status/${tweetId}|LINK>` + EOL
		}

		const res = await webhook.send({
			"username": 'Twitter Cannon 🤖',
			"blocks": [
				{
					"type": "section", 
					"text": {
						"type": "mrkdwn",
						"text": `*${new Date().toUTCString()} - <https://twitter.com/${handle}|${handle}>*`,
					} 
				},
				{
					"type": "section", 
					"text": {
						"type": "mrkdwn",
						"text": text,
					} 
				}
			]
		})
		return res
	}catch(e){
		logger('error in logToSlack', e.code, ':', e.message)
	}
}
