import { botCheck } from "../services/bot-check"
import { accountClaimed } from "../services/db-claimed-check"
import { registerUser } from "../services/db-insert-user"
import { transferAr } from "../services/ar-transfer"
import { getTweetDataWithRetry } from "../services/tweet-search"
import { logger } from "../utils/logger"
import { sendAirdropTweetReply, sendFailTweetReply, sendSuccessTweetReply } from "../services/twitter-reply"
import { getDbHeartbeat } from "../utils/db-heartbeat"
import { Counter, register } from "prom-client"
import { metricPrefix } from "../utils/constants"
import { slackLogger } from "../utils/slack-logger"
import { airdropCheck } from "../services/airdrop-check"


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
	
	try{

		/* Wait for Tweet */
		
		const tweetResult = await getTweetDataWithRetry(address) 

		if(!tweetResult.value){
			logger(address, 'gave up searching for tweet.', new Date().toUTCString())
			ctrClaim.labels('giveup').inc()
			return;
		}

		const twitterName = tweetResult.handle!
		const twitterId = tweetResult.twitterId!


		/* Already claimed check */

		const claim = await accountClaimed(twitterId)
		if(claim.exists){
			ctrClaim.labels('duplicate').inc()
			logger(address, twitterName, 'already claimed', claim.exists, 'exiting.', new Date().toUTCString())
			return;
		}

		// quick hb check in case we're wasting API calls
		let heartbeat = await getDbHeartbeat()
		if(!heartbeat){
			logger(address, 'server detected no db-heartbeat. exiting', new Date().toUTCString())
			return;
		}

		let approved = true
		let bot_score = 0
		let reason = ''

		/* Airdrop retweeter check */

		const airResult = await airdropCheck(twitterName, twitterId)
		if(airResult){
			if(airResult.count > 4){
				approved = false
				reason = 'airdrop'
			} else if(!airResult.daysOld){
				approved = false
				reason = 'fake. no tweets & deleted verify tweet'
			} else if (airResult.daysOld < 28){
				approved = false
				reason = 'account too young'
			}
			/**
			 * TODO:
			 * airResult.count < 5-10?? => inactive account 
			 */
		}
		//else case is logging an unhandled error 
		logger(address, twitterName, 'airdrop passed', approved, reason)


		/* Do bot check */

		if(approved !== false){
			const botResult = await botCheck(twitterName)
			approved = botResult.passed
			bot_score = botResult.botScore
			reason = botResult.reason
			logger(address, twitterName, twitterId, 'bot-check passed', botResult.passed, botResult.reason)
		}

		/* Write out resuls to DB */

		const success = await registerUser({
			twitterId,
			handle: twitterName,
			address, // UI searches on this
			approved,
			bot_score,
			reason,
			date_handled: new Date().toUTCString(), //now
		})
		logger(twitterName, 'write to db', success, new Date().toUTCString())
		if(!success){
			logger(twitterName, 'failure to write record to db', success, 'exiting.')
			return;
		}

		/* Transfer AR to the new wallet */

		let tweetId_str: string
		if(approved){
			ctrClaim.labels('success').inc()
			tweetId_str = await sendSuccessTweetReply(tweetResult.tweetId!, twitterName)
			await transferAr(address)

		} else if(reason === 'airdrop'){
			ctrClaim.labels('failed').inc()
			ctrClaim.labels('airdrop').inc()
			tweetId_str = await sendAirdropTweetReply(tweetResult.tweetId!, twitterName)
			logger(twitterName, 'no AR transfer for airdrop account')
			
		} else if(reason === 'account too young' || reason.startsWith('account created ')){
			ctrClaim.labels('failed').inc()
			ctrClaim.labels('young').inc()
			tweetId_str = await sendFailTweetReply(tweetResult.tweetId!, twitterName)
			logger(twitterName, 'no AR transfer for young account')

		} else{
			ctrClaim.labels('failed').inc()
			ctrClaim.labels('fake').inc()
			tweetId_str = await sendFailTweetReply(tweetResult.tweetId!, twitterName)
			logger(twitterName, 'no AR transfer for fake account')
		}

	} catch(e){
		logger('UNHANDLED ERROR in serverSide-Processing', e.code + ':' + e.message)
		slackLogger('🚨 ALERT! Unhandled error in serverSide-Processing 🚨', e.code + ':' + e.message)
 }
}