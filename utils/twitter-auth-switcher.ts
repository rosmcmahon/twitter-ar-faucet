/**
 * We're hitting Twitter API limits for max tweet replies (300/3hrs)
 * Cannot extend this limit by upgrading account - no option.
 * Workaround is to set up multiple accounts and switch between them.
 */
import Twitter from 'twitter-lite'
import { metricPrefix } from '../utils/constants'
import { Counter, register } from 'prom-client'

interface TwitterLiteEntry {
	twit: Twitter
	counterReply: Counter<'reply0'|'reply1'|'reply2'>
}

let _twitterLiteEntries: TwitterLiteEntry[] = []

export const getTwitterLiteEntry = () => {
	//if first run load all credentials from .env file
	if(_twitterLiteEntries.length === 0){
		load()
	}
	//split the load by rotating a queue. shift(pop) head and push to tail of queue
	// if we encounter "concurrency" issue, it will be down to this operation
	const x = _twitterLiteEntries.shift()
	if(x === undefined) throw new Error('no TwitterLiteEntry found.')
	_twitterLiteEntries.push(x)
	
	const test = async()=>{
		console.log('*****************************')
		console.log('number of entries',_twitterLiteEntries.length)
		console.log(JSON.stringify(await x.twit.getBearerToken()))
		console.log('*****************************')
	}
	test()

	return x
}

// run on program start 
const load = () =>{
	if(!process.env.TWITTER_API_KEY1) throw new Error('process.env.TWITTER_API_KEY1=undefined. Check .env file')

	// load .env entries individually, as arrays not supported

	//create twitter-lite object
	const twit0 = new Twitter({
		consumer_key: process.env.TWITTER_API_KEY!,
		consumer_secret: process.env.TWITTER_API_SECRET!,
		access_token_key: process.env.TWITTER_ACCESS_TOKEN,
		access_token_secret: process.env.TWITTER_ACCESS_SECRET,
	})
	
	const ctrReplyName0 = metricPrefix + 'twit_reply_counter0'
	let ctrReply0 = register.getSingleMetric(ctrReplyName0) as Counter<'reply0'>
	if(!ctrReply0){
			ctrReply0 = new Counter({
			name: ctrReplyName0,
			help: ctrReplyName0 + '_help',
			aggregator: 'sum',
			labelNames: ['reply0'],
		})
	}
	_twitterLiteEntries.push({twit: twit0, counterReply: ctrReply0})

	const twit1 = new Twitter({
		consumer_key: process.env.TWITTER_API_KEY1!,
		consumer_secret: process.env.TWITTER_API_SECRET1!,
		access_token_key: process.env.TWITTER_ACCESS_TOKEN1,
		access_token_secret: process.env.TWITTER_ACCESS_SECRET1,
	})
	
	const ctrReplyName1 = metricPrefix + 'twit_reply_counter1'
	let ctrReply1 = register.getSingleMetric(ctrReplyName1) as Counter<'reply1'>
	if(!ctrReply1){
			ctrReply1 = new Counter({
			name: ctrReplyName1,
			help: ctrReplyName1 + '_help',
			aggregator: 'sum',
			labelNames: ['reply1'],
		})
	}
	_twitterLiteEntries.push({twit: twit1, counterReply: ctrReply1})

	/* 3. Reserved for future use */

	// const twit2 = new Twitter({
	// 	consumer_key: process.env.TWITTER_API_KEY2!,
	// 	consumer_secret: process.env.TWITTER_API_SECRET2!,
	// 	access_token_key: process.env.TWITTER_ACCESS_TOKEN2,
	// 	access_token_secret: process.env.TWITTER_ACCESS_SECRET2,
	// })
	
	// const ctrReplyName1 = metricPrefix + 'twit_reply_counter2'
	// let ctrReply2 = register.getSingleMetric(ctrReplyName1) as Counter<'reply2'>
	// if(!ctrReply2){
	// 		ctrReply2 = new Counter({
	// 		name: ctrReplyName1,
	// 		help: ctrReplyName1 + '_help',
	// 		aggregator: 'sum',
	// 		labelNames: ['reply2'],
	// 	})
	// }
	// _cacheTwitterLiteAuth.push({twit: twit2, counter: ctrReply2})


}