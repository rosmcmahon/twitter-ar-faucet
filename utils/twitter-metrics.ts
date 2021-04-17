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

const gauSearchName = twitPrefix + 'search_gauge'
let gauSearch = register.getSingleMetric(gauSearchName) as Gauge<'name'>
if(!gauSearch){
		gauSearch = new Gauge({
		name: gauSearchName,
		help: gauSearchName + '_help',
		labelNames: ['name'],
	})
}

let _lastUpdate = 0

export const updateTwitterMetrics = async() => {
	/* do not make too many requests - rate-limit averages to 1 request every 5 seconds */
	const now = new Date().valueOf() //millisecs
	if((now - _lastUpdate) > 10000){
		logger('twitter-metrics', 'updating metrics', '_lastUpdate:',_lastUpdate, 'now:', now)
		_lastUpdate = now
		doUpdate()
	}
}
const doUpdate = async() => {
	try{
		const res = await axios.get('https://api.twitter.com/1.1/application/rate_limit_status.json?resources=search', {
			headers: {
				Authorization: `Bearer ${process.env.BEARER_TOKEN}`,
			}
		})

		const searchLimits: RateLimit = res.data.resources.search['/search/tweets']

		for (const key in searchLimits) {
			gauSearch.labels(key).set(searchLimits[key as keyof RateLimit])
		}

	}catch(e){
		logger('twitter-metrics Error', e.code, ':', e.message)
	}
}