import Axios from "axios"
import { logger } from "../utils/logger"

const sleep = async (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms))

interface TweetSearchResult {
  value: boolean;
  handle?: string;
  rateLimitReset: number 
}

export const getTweetHandle = async (address: string) => {

  logger(address, 'searching tweets')

  const res = await Axios({
    method: 'GET',
    url: 'https://api.twitter.com/1.1/search/tweets.json',
    params: {
      q: address
    },
    headers: {
      Authorization: `Bearer ${process.env.BEARER_TOKEN}`,
    }
  })
  

  const numPosts = res.data.statuses.length
  
  if(numPosts > 0){
    // choose the oldest tweet - maybe bots are retweeting ?
    let twitterHandle: string = res.data.statuses[numPosts - 1].user.screen_name
    logger(address, 'tweet found:', twitterHandle, res.data.statuses[numPosts - 1].text)
    
    return {
      value: true,
      handle: twitterHandle,
    }
  }

  logger(address, numPosts, 'tweets found')
  
  return {
    value: false,
  }
}

export const getTweetHandleWithRetry = async (address: string ): Promise<TweetSearchResult> => {

  let sleepMs = 5000 //(sleepMs*2 <= 315000) // 6 tries over 5'15s
  let tries = 6
  let rateLimitWait = 0
  
	while(tries--){
    
    let waitTime = sleepMs + rateLimitWait
		logger(address, 'server waiting another', waitTime, 'ms...')
    await sleep(waitTime) 

		try{
      let resultHandle = await getTweetHandle(address)
      
			if(resultHandle.value){
				return {
          value: true,
          handle: resultHandle.handle,
          rateLimitReset: 0,
        }
      }

      // Adjust sleep timers for the next attempt
      rateLimitWait = 0
      sleepMs *= 2
		} catch(err) {
      const res = err.response
      
			if(res.status === 429){
				rateLimitWait = new Date(Number(res.headers['x-rate-limit-reset'])*1000).valueOf() - new Date().valueOf()
        logger(address, res.status, res.statusText, 'added ' + rateLimitWait + 'ms extra')
        
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
    return Object.assign({rateLimitReset: 0}, await getTweetHandle(address))
  } 
  catch (e) {
    const res = e.response
    if(res.status === 429){
      let rateLimitReset = Number( res.headers['x-rate-limit-reset'] )
      logger(address + ' (API)', res.status, res.statusText, rateLimitReset) 
      return {
        value: false,
        rateLimitReset,
      }
    } else{
      throw e
    }
  }
}