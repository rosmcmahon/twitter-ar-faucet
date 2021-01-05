import { botCheck } from "../services/bot-check"
import { handleClaimed } from "../services/db-claimed-check"
import { registerUser } from "../services/db-insert-user"
import { getTweetHandleWithRetry } from "../services/tweet-search"
import { logger } from "../utils/logger"


export const serverLoop = async (address: string) => {
	
	/* Wait for Tweet */
	
	const handleResult = await getTweetHandleWithRetry(address)

	if(!handleResult.value){
		logger(address, 'gave up searching for tweet.')
		return
	}

	const handle = handleResult.handle!


	/* Handle already claimed check */

	const handleClaim = await handleClaimed(handle)
	if(handleClaim.exists){
		logger(handle, 'already claimed', handleClaim.exists, 'exiting.')
		return;
	}

	/* Do bot check on handle */

	const botResult = await botCheck(handle)
	logger(handle, 'bot-check passed', botResult.passed, botResult.reason)

	/* Write out resuls to DB */

	const success = await registerUser({
		handle,
		address, // UI searches on this
		approved: botResult.passed,
		bot_score: botResult.botScore,
		reason: botResult.reason,
		date_handled: new Date().toUTCString(), //now
	})
	logger(handle, 'write to db', success)

}