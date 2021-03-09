import { IncomingWebhook } from '@slack/webhook'
import { EOL } from 'os'
import { BotCheckResult } from '../services/bot-check'

const webhook = new IncomingWebhook(process.env.SLACK_WEBHOOK!)

export const logToSlack = async (handle: string, twitterId: string, address: string, botresult: BotCheckResult, tweetId?: string) => {

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
}
