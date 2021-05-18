import axios from 'axios'
import { Gauge, register } from 'prom-client'
import { metricPrefix } from './constants'
import { logger } from './logger'

interface RateLimit {
	limit: number 
	remaining: number
	reset: number //unixtime 
}

const twitPrefix = metricPrefix + 'twit_limits_'

const gauSearchNameDaisy = twitPrefix + 'search_gauge'
let gauSearchDaisy = register.getSingleMetric(gauSearchNameDaisy) as Gauge<'name'>
if(!gauSearchDaisy){
		gauSearchDaisy = new Gauge({
		name: gauSearchNameDaisy,
		help: gauSearchNameDaisy + '_help',
		labelNames: ['name'],
	})
}

const gauSearchName1Rover = twitPrefix + 'search_gauge1'
let gauSearch1Rover = register.getSingleMetric(gauSearchName1Rover) as Gauge<'name'>
if(!gauSearch1Rover){
		gauSearch1Rover = new Gauge({
		name: gauSearchName1Rover,
		help: gauSearchName1Rover + '_help',
		labelNames: ['name'],
	})
}

let _lastUpdate = 0

export const updateTwitterMetrics = async() => {
	/* do not make too many requests - rate-limit averages to 1 request every 5 seconds */
	const now = new Date().valueOf() //millisecs
	if((now - _lastUpdate) > 10000){

		_lastUpdate = now
		doUpdate()
	}
}
const doUpdate = async() => {
	try{

		const resDaisy = await axios.get('https://api.twitter.com/1.1/application/rate_limit_status.json?resources=search', {
			headers: {
				Authorization: `Bearer ${process.env.BEARER_TOKEN}`,
			}
		})

		const searchLimitsDaisy: RateLimit = resDaisy.data.resources.search['/search/tweets']

		for (const key in searchLimitsDaisy) {
			gauSearchDaisy.labels(key).set(searchLimitsDaisy[key as keyof RateLimit])
		}

		
		const res1Rover = await axios.get('https://api.twitter.com/1.1/application/rate_limit_status.json?resources=search', {
			headers: {
				Authorization: `Bearer ${process.env.BEARER_TOKEN1}`,
			}
		})

		const searchLimits1Rover: RateLimit = res1Rover.data.resources.search['/search/tweets']

		for (const key in searchLimits1Rover) {
			gauSearch1Rover.labels(key).set(searchLimits1Rover[key as keyof RateLimit])
		}



	}catch(e){
		logger('twitter-metrics Error', e.code, ':', e.message)
	}
}