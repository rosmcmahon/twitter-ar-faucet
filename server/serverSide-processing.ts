import { botCheck } from "../services/bot-check"
import { accountClaimed } from "../services/db-claimed-check"
import { registerUser } from "../services/db-insert-user"
import { transferAr } from "../services/ar-transfer"
import { getTweetDataWithRetry } from "../services/tweet-search"
import { logger } from "../utils/logger"
import { sendFailTweetReply, sendSuccessTweetReply } from "../services/twitter-reply"
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

		let freePass = false // if followers > 1000
		let approved = true
		let bot_score = 0
		let reason = ''

		/* Airdrop retweeter & other checks */

		const airResult = await airdropCheck(twitterName, twitterId)
		if(airResult){
			if(airResult.followersCount >= 1000){
				freePass = true
				approved = true
				reason = 'free pass. followers_count:' + airResult.followersCount
			} else if(!airResult.daysOld){
				approved = false
				reason = 'fake. no tweets & deleted verify tweet'
			} else if(airResult.count > 4){
				approved = false
				reason = 'airdrop'
			} else if (airResult.daysOld < 28){
				approved = false
				reason = 'account too young'
			}
			/**
			 * TODO:
			 * airResult.count < 5-10?? => inactive account 
			 */
		}
		//else case is logging an unhandled error in airdropCheck
		logger(address, twitterName, 'airdrop passed', approved, reason)


		/* Do bot check */

		if(!freePass && approved !== false){
			try{
				const botResult = await botCheck(twitterName)
				approved = botResult.passed
				bot_score = botResult.botScore
				reason = botResult.reason
				logger(address, twitterName, twitterId, 'bot-check passed', botResult.passed, botResult.reason)
			}catch(e){
				logger(address, twitterName, twitterId, '⭐ Ignoring error in bot-check during downtime.', e.name, ':', e.message)
				slackLogger(address, twitterName, twitterId, '⭐ Ignoring error in bot-check during downtime. Applying alternatives.', e.name, ':', e.message)
				//do not check if airResult is defined. if it's not we want this to crash out as there will be no protection
				if(airResult && (airResult.usableTweets < 10)){
					approved = false
					reason = 'fake. not enough usable tweets. too many deleted or inactive account.'
				}
			}
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
			if(freePass){ 
				ctrClaim.labels('freepass').inc()
			}
			tweetId_str = await sendSuccessTweetReply(tweetResult.tweetId!, twitterName)
			await transferAr(address)

		} else{ 
			ctrClaim.labels('failed').inc()
			tweetId_str = await sendFailTweetReply(tweetResult.tweetId!, twitterName)
			if(reason === 'airdrop'){
				ctrClaim.labels('airdrop').inc()
				logger(twitterName, 'no AR transfer for airdrop account')
			} else if(reason === 'account too young' || reason.startsWith('account created ')){
				ctrClaim.labels('young').inc()
				logger(twitterName, 'no AR transfer for young account')
			} else{
				ctrClaim.labels('fake').inc()
				logger(twitterName, 'no AR transfer for fake account')
			}
		}

	} catch(e){
		logger('UNHANDLED ERROR in serverSide-Processing', e.code + ':' + e.message)
		slackLogger('🚨 ALERT! Unhandled error in serverSide-Processing 🚨', e.code + ':' + e.message)
 }
}