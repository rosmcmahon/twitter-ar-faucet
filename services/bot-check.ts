import { logger } from "../utils/logger";

const Botometer = require('botometer').Botometer

interface IsBotReturn {
	passed: boolean
	reason: string
	botScore: number
}

export const botCheck = async (twitterHandle: string): Promise<IsBotReturn> => {

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

	/* Check account age requirement - this uses > 28 days */

	const daysOld = ( new Date().valueOf() - new Date(created_at).valueOf() ) / 86400000

	if(daysOld < 28){
		logger(twitterHandle, 'account too young:', daysOld.toFixed(1), 'days')
		return {
			passed: false,
			reason: 'account created ' + new Date(created_at),
			botScore: display_score,
		} 
	}

	/* Check the botometer score (0-5), this uses > 1 is a bot */

	if(display_score > 3.5){
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
}