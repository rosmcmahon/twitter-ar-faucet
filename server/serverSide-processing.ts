import { botCheck } from "../services/bot-check"
import { accountClaimed } from "../services/db-claimed-check"
import { registerUser } from "../services/db-insert-user"
import { transferAr } from "../services/ar-transfer"
import { getTweetDataWithRetry } from "../services/tweet-search"
import { logger } from "../utils/logger"
import { sendFailTweetReply, sendSuccessTweetReply } from "../services/twitter-reply"
import { getDbHeartbeat } from "../utils/db-heartbeat"
import { logToSlack } from "../utils/slack-logger"
import { Counter, register } from "prom-client"
import { metricPrefix } from "../utils/constants"

const ctrClaimName = metricPrefix + 'claim_counter'
let ctrClaim: Counter<'claim'> = register.getSingleMetric(ctrClaimName) as Counter<'claim'>
if(!ctrClaim){
	ctrClaim = new Counter({
		name: ctrClaimName,
		help: ctrClaimName + '_help',
		aggregator: 'sum',
		labelNames: ['claim'],
	})
}

export const serverSideClaimProcessing = async (address: string) => {
	
	/* Wait for Tweet */
	
	const tweetResult = await getTweetDataWithRetry(address) 

	if(!tweetResult.value){
		logger(address, 'gave up searching for tweet.', new Date().toUTCString())
		ctrClaim.labels('giveup').inc()
		return;
	}

	const handle = tweetResult.handle!
	const twitterId = tweetResult.twitterId!



	/* Handle already claimed check */

	const claim = await accountClaimed(twitterId)
	if(claim.exists){
		ctrClaim.labels('duplicate').inc()
		logger(address, handle, 'already claimed', claim.exists, 'exiting.', new Date().toUTCString())
		await logToSlack(handle, twitterId, address, {
			botScore: 0,
			passed: false,
			reason: 'already claimed'
		})
		return;
	}

	/* Do bot check on handle */

	// quick hb check in case we're wasting calls to botometer (& twitter search)
	let heartbeat = await getDbHeartbeat()
	if(!heartbeat){
		logger(address, 'server detected no db-heartbeat. exiting', new Date().toUTCString())
		return;
	}

	const botResult = await botCheck(handle)
	logger(address, handle, twitterId, 'bot-check passed', botResult.passed, botResult.reason, new Date().toUTCString())

	/* Write out resuls to DB */

	const success = await registerUser({
		twitterId,
		handle,
		address, // UI searches on this
		approved: botResult.passed,
		bot_score: botResult.botScore,
		reason: botResult.reason,
		date_handled: new Date().toUTCString(), //now
	})
	logger(handle, 'write to db', success, new Date().toUTCString())
	if(!success){
		logger(handle, 'failure to write record to db', success, 'exiting.')
		return;
	}

	/* Transfer AR to the new wallet */

	let tweetId_str: string
	if(botResult.passed){
		ctrClaim.labels('success').inc()
		tweetId_str = await sendSuccessTweetReply(tweetResult.tweetId!, handle)
		await logToSlack(handle, twitterId, address, botResult, tweetId_str)
		await transferAr(address)
	} else{
		ctrClaim.labels('failed').inc()
		tweetId_str = await sendFailTweetReply(tweetResult.tweetId!, handle)
		await logToSlack(handle, twitterId, address, botResult, tweetId_str)
		logger(handle, 'no AR transfer for this bot')
	}

}