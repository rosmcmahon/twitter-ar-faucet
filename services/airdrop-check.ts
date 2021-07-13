import axios from 'axios'
import { logger } from '../utils/logger'
import { slackLogger } from '../utils/slack-logger'


let _toggle = true
const getBearer = ()=>{
  _toggle = !_toggle
  if(_toggle){
    return process.env.BEARER_TOKEN
  }else{
    return process.env.BEARER_TOKEN1
  }
}

export const airdropCheck = async(twitterHandle: string, twitterId: string)=> {
	try {
		const res = await axios(`https://api.twitter.com/1.1/statuses/user_timeline.json`, {
			params: {
				user_id: twitterId,
				tweet_mode: 'extended',
				count: 20,
			},
			headers: {
				Authorization: `Bearer ${getBearer()}`,
			}
		})

		let tweets: any[] = res.data
		tweets = tweets.filter(tweet=>{ if(tweet) return tweet }) // remove any undefined (deleted)

		let text = ''
		for (const tweet of tweets) {
			if(tweet.retweeted_status){
				text += tweet.retweeted_status.full_text  + '\n'
			} else{
				text += tweet.full_text + '\n'
			}
		}

		const matches = text.match(/airdrop|giveaway|giving away|lucky winner| rt[!|.| ]|repost tweet|retweet/ig) || []

		
		let daysOld = null
		let followersCount = null
		// edge case: empty account & verify tweet deleted before previous api call (potentially fake account)
		if(tweets[0]){
			daysOld = ( new Date().valueOf() - new Date(tweets[0].user.created_at).valueOf() ) / 86400000
			followersCount = tweets[0].user.followers_count
		}
		
		const results = {
			count: matches.length,
			usableTweets: tweets.length,
			daysOld,
			followersCount,
		}

		if(process.env.NODE_ENV !== 'production'){
			/* debugging output here */
			console.log(res.data[2])
			console.log(matches)
			console.log(results)
		}

		return results
	}catch(e) {
		logger(twitterHandle, 'UNHANDLED error in airdropCheck', e.name, ':', e.message)
		slackLogger(twitterHandle, 'UNHANDLED error in airdropCheck', e.name, ':', e.message)
	}
}
