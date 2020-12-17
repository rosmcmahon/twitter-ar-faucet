import Axios from "axios"
import { logger } from "../utils/logger"


export const getTweetHandle = async (address: string) => {
  //DEBUG:
  if(process.env.NODE_ENV === 'development'){
    // address = 'DF0dxHueHaNAp3I_0q5I0EwJTtWQogvOUZR2x-ADx6Q' // @rosmcmahon_real
    address = 'U5p5oWnzTrs2-4nmd4VWkpxoTSHQOukWtGqq27-zWnw' // @RodSchuffler
  }

  logger('searching for', address)

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
    logger('found:', twitterHandle, res.data.statuses[numPosts - 1].text)
    
    return {
      value: true,
      handle: twitterHandle,
    }
  }

  logger(numPosts, 'posts found. returning false')
  return {
    value: false,
    handle: '',
  }
}