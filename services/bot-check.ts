const Botometer = require('botometer').Botometer

export const isBot = async (twitterHandle: string, accessToken?: string, accessTokenSecret?: string) => {
	/**
	 * This is a "borrowed" pre-authenticated set of keys.
	 * 
	 *      *** DO NOT USE IN PRODUCTION ***
	 * 
	 */
	const botometer = new Botometer({
		consumerKey: "ikNwHJe2PFBTBFdAi3NVnkwsM",
		consumerSecret: "C65EUhUh7crrSzk5D3p5ZH8NlfGjFjUEPGjmm0Pp2SYUmJTnkO",
		accessToken: "97265487-zw76B5hOJ49TIwvbeewqkkfjlu17irgzMkGa7j9jU",
		accessTokenSecret: "noo7JZGhVK1aXPPNfUT6RYUIqoDboe6c0K8iLQDtuKPvL",
		rapidApiKey: "ca486366b2msh479a946343e93efp1afb77jsn1c036326d5fb",
		supressLogs: false,
		usePro: true,
	});

	/* TODO: once 3-legged OAuth is setup we will use: */

	// const botometer = new Botometer({
	// 	consumerKey: process.env.TWITTER_KEY,
	// 	consumerSecret: process.env.TWITTER_SECRET,
	// 	accessToken,
	// 	accessTokenSecret,
	// 	rapidApiKey: process.env.RAPID_KEY,
	// 	supressLogs: false,
	// 	usePro: true,
	// });

	const results = await botometer.getScores([twitterHandle]) 

	const screen_name =		results[0].user.user_data.screen_name
	const created_at =		results[0].user.user_data.created_at
	const display_score =	results[0].display_scores.universal.overall
	console.log(screen_name,created_at,display_score)

	/**
	 * TODO: check how old the account is.
	 * for now, just use the botometer score alone
	 */

	const age = ( new Date().valueOf() - new Date(created_at).valueOf() ) / 1000 // seconds
	const month = 30 * 86400 // seconds
	if(age < month){
		console.log('account too young:', age, 'secs')
		return true
	}

	if(display_score > 1){
		console.log('details .display_score > 1', display_score)
		return true
	}
	console.log('not a bot, score', display_score)
	return false
}