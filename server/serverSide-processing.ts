import { botCheck } from "../services/bot-check"
import { accountClaimed } from "../services/db-claimed-check"
import { registerUser } from "../services/db-insert-user"
import { transferAr } from "../services/ar-transfer"
import { getTweetDataWithRetry } from "../services/tweet-search"
import { logger } from "../utils/logger"
import { sendTwitterReply } from "../services/twitter-reply"


export const serverSideClaimProcessing = async (address: string) => {
	
	/* Wait for Tweet */
	
	const tweetResult = await getTweetDataWithRetry(address) 

	if(!tweetResult.value){
		logger(address, 'gave up searching for tweet.', new Date().toUTCString())
		return;
	}

	const handle = tweetResult.handle!
	const twitterId = tweetResult.twitterId!



	/* Handle already claimed check */

	const claim = await accountClaimed(twitterId)
	if(claim.exists){
		logger(address, handle, 'already claimed', claim.exists, 'exiting.', new Date().toUTCString())
		return;
	}

	/* Do bot check on handle */

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

	if(botResult.passed){
		await sendTwitterReply(tweetResult.tweetId!, handle)
		await transferAr(address)
	} else{
		logger(handle, 'no AR transfer for this bot')
	}

}