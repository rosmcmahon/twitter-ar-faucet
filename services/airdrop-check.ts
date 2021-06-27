import axios from 'axios'
import { logger } from '../utils/logger'


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
				// trim_user: true,
				tweet_mode: 'extended',
				count: 20,
			},
			headers: {
				Authorization: `Bearer ${getBearer()}`,
			}
		})

		console.log(res.data[2])

		let tweets: any[] = res.data
		tweets = tweets.filter(tweet=>{ if(tweet) return tweet }) // remove any undefined (deleted)
		logger(twitterHandle, 'number of valid tweets returned', tweets.length)

		let text = ''
		for (const tweet of tweets) {
			if(tweet.retweeted_status){
				text += tweet.retweeted_status.full_text  + '\n'
			} else{
				text += tweet.full_text + '\n'
			}
		}

		const matches = text.match(/airdrop|giveaway|giving away|lucky winner| rt[!|.| ]|repost tweet|retweet/ig)

		if(matches){
			// console.log(matches)
			return matches.length
		}
		console.log(twitterHandle, 0)
		return 0;
	}catch(e) {
		logger(twitterHandle, 'UNHANDLED error in airdropCheck')
	}
}
