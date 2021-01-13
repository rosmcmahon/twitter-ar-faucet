import { botCheck } from "../services/bot-check"
import { handleClaimed } from "../services/db-claimed-check"
import { registerUser } from "../services/db-insert-user"
import { transferAr } from "../services/ar-transfer"
import { getTweetHandleWithRetry } from "../services/tweet-search"
import { logger } from "../utils/logger"


export const serverSideClaimProcessing = async (address: string) => {
	
	/* Wait for Tweet */
	
	const handleResult = await getTweetHandleWithRetry(address) 

	if(!handleResult.value){
		logger(address, 'gave up searching for tweet.', new Date().toUTCString())
		return;
	}

	const handle = handleResult.handle!


	/* Handle already claimed check */

	const handleClaim = await handleClaimed(handle)
	if(handleClaim.exists){
		logger(address, handle, 'already claimed', handleClaim.exists, 'exiting.', new Date().toUTCString())
		return;
	}

	/* Do bot check on handle */

	const botResult = await botCheck(handle)
	logger(address, handle, 'bot-check passed', botResult.passed, botResult.reason, new Date().toUTCString())

	/* Write out resuls to DB */

	const success = await registerUser({
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
		await transferAr(address)
	} else{
		logger(handle, 'no AR transfer for this bot')
	}

}