import Axios from "axios"
import { logger } from "../utils/logger"
import { currentTwitterReset, getRateLimitWait } from "../utils/ratelimit-singletons"

const sleep = async (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms))

interface TweetDataResult {
  value: boolean
  handle?: string
  twitterId?: string
  tweetId?: string
}
interface TweetSearchResult extends TweetDataResult {
  rateLimitReset: number 
}

export const getTweetData = async (address: string): Promise<TweetDataResult>  => {

  logger(address, 'searching tweets')

  const res = await Axios({
    method: 'GET',
    url: 'https://api.twitter.com/1.1/search/tweets.json',
    params: {
      q: '"' + address + '"' // quotes are important, searching for exact string
    },
    headers: {
      Authorization: `Bearer ${process.env.BEARER_TOKEN}`,
    }
  })
  

  const numPosts = res.data.statuses.length
  
  if(numPosts > 0){
    // choose the oldest tweet - maybe bots are retweeting ?
    const tweet = res.data.statuses[numPosts - 1]
    const twitterHandle: string = tweet.user.screen_name
    const twitterId: string = tweet.user.id_str
    const tweetId: string = tweet.id_str
    logger(address, 'tweet found:', twitterHandle, twitterId, tweetId, tweet.text)
    
    return {
      value: true,
      handle: twitterHandle,
      twitterId,
      tweetId,
    }
  }

  logger(address, numPosts, 'tweets found')
  
  return {
    value: false,
  }
}

export const getTweetDataWithRetry = async (address: string ): Promise<TweetSearchResult> => {

  logger(address, 'hack! waiting an extra 30 seconds for user to download wallet, post tweet, and hit next twice')
  await sleep(30000)

  let sleepMs = 5000 //(sleepMs*2 <= 315000) // 6 tries over 5'15s
  let tries = 6
  
	while(tries--){
    
    let waitTime = sleepMs + getRateLimitWait()
		logger(address, 'server waiting another', waitTime, 'ms...')
    await sleep(waitTime) 

		try{
      let resultData = await getTweetData(address)
      
			if(resultData.value){
				return Object.assign({rateLimitReset: 0}, resultData)
      }

      // Adjust sleep timers for the next attempt
      sleepMs *= 2
		} catch(err) {
      const res = err.response
      
			if(res.status === 429){
        currentTwitterReset( Number(res.headers['x-rate-limit-reset']) )
        logger(address,'**(Server: Twitter RateLimit applied)**', res.status, res.statusText, 'added ' + getRateLimitWait() + 'ms extra')
        
			} else{
				throw err
			}
    }
	}

  // gave up waiting
  return {
    value: false,
    rateLimitReset: 0,
  }
}

export const getTweetHandleOrWaitTime = async (address: string): Promise<TweetSearchResult> => {
  try {
    return Object.assign({rateLimitReset: 0}, await getTweetData(address))
  } 
  catch (e) {
    const res = e.response
    if(res.status === 429){
      let rateLimitReset = Number( res.headers['x-rate-limit-reset'] )
      logger(address,'**(API: Twitter RateLimit applied)**', res.status, res.statusText, rateLimitReset) 
      return {
        value: false,
        rateLimitReset,
      }
    } else{
      throw e
    }
  }
}