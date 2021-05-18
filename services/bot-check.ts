import { Histogram, linearBuckets, register } from "prom-client";
import { metricPrefix } from "../utils/constants";
import { logger } from "../utils/logger";
const Botometer = require('botometer').Botometer


const hstBotscoreName = metricPrefix + 'botscore_histogram'
let hstBotscore = register.getSingleMetric(hstBotscoreName) as Histogram<'score_type'>
if(!hstBotscore){
		hstBotscore = new Histogram({
		name: hstBotscoreName,
		help: hstBotscoreName + '_help',
		labelNames: ['score_type'],
		buckets: [1, 2, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 3, 4, 5]
	})
}



export interface BotCheckResult {
	passed: boolean
	reason: string
	botScore: number
}

export const botCheck = async (twitterHandle: string): Promise<BotCheckResult> => {
	try{

		/* Get the botometer score, and twitter data */

		const botometer = new Botometer({
			consumerKey: process.env.TWITTER_API_KEY,
			consumerSecret: process.env.TWITTER_API_SECRET,
			accessToken: process.env.TWITTER_ACCESS_TOKEN,
			accessTokenSecret: process.env.TWITTER_ACCESS_SECRET,
			rapidApiKey: process.env.RAPID_KEY,
			supressLogs: false,
			usePro: true,
		});

		const results = await botometer.getScores([twitterHandle]) 

		const screen_name =		results[0].user.user_data.screen_name
		const created_at =		results[0].user.user_data.created_at
		const display_score =	results[0].display_scores.universal.overall

		logger(twitterHandle, screen_name, created_at, display_score)

		hstBotscore.observe(display_score)
		
		/* Commenting out the logging of the other unused score types for now, perhaps this can be added later */		
		// const universalScores = results[0].display_scores.universal
		// for (const key in universalScores) {
		// 	hstBotscore.labels(key).observe(universalScores[key])
		// }

		/* Check account age requirement - this uses >= 28 days */

		const daysOld = ( new Date().valueOf() - new Date(created_at).valueOf() ) / 86400000

		if(daysOld < 28){
			logger(twitterHandle, 'account too young:', daysOld.toFixed(1), 'days')
			return {
				passed: false,
				reason: 'account created ' + new Date(created_at),
				botScore: display_score,
			} 
		}

		/* Check the botometer score (0-5), this uses > 2.5 is a bot */

		if(display_score > 2.5){
			return {
				passed: false,
				reason: 'failed botometer ' + display_score,
				botScore: display_score,
			}
		}

		return {
			passed: true,
			reason: 'OK ' + display_score,
			botScore: display_score,
		}

	}catch(e){
		if(e.code && e.code === 136){
			logger(twitterHandle, 'Error: You have been blocked from viewing this user\'s profile.')
			return {
				passed: false,
				reason: 'private account',
				botScore: 5,
			}
		}
		throw e
	}
}