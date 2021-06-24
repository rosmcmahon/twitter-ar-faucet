import axios from 'axios'
import { Gauge, register } from 'prom-client'
import { metricPrefix } from './constants'
import { logger } from './logger'

interface RateLimit {
	limit: number 
	remaining: number
	// reset: number //unixtime <= do not need this
}

const twitPrefix = metricPrefix + 'twit_limits_'

const gauSearchNameDaisy = twitPrefix + 'search_gauge'
let gauSearchDaisy = register.getSingleMetric(gauSearchNameDaisy) as Gauge<'instance'|'name'>
if(!gauSearchDaisy){
		gauSearchDaisy = new Gauge({
		name: gauSearchNameDaisy,
		help: gauSearchNameDaisy + '_help',
		labelNames: ['instance', 'name'],
	})
}
const gauTimelineNameDaisy = twitPrefix + 'timeline_gauge'
let gauTimelineDaisy = register.getSingleMetric(gauTimelineNameDaisy) as Gauge<'instance'|'name'>
if(!gauTimelineDaisy){
		gauTimelineDaisy = new Gauge({
		name: gauTimelineNameDaisy,
		help: gauTimelineNameDaisy + '_help',
		labelNames: ['instance', 'name'],
	})
}

const gauSearchName1Rover = twitPrefix + 'search_gauge1'
let gauSearch1Rover = register.getSingleMetric(gauSearchName1Rover) as Gauge<'instance'|'name'>
if(!gauSearch1Rover){
		gauSearch1Rover = new Gauge({
		name: gauSearchName1Rover,
		help: gauSearchName1Rover + '_help',
		labelNames: ['instance','name'],
	})
}

const gauTimelineName1Rover = twitPrefix + 'timeline_gauge1'
let gauTimeline1Rover = register.getSingleMetric(gauTimelineName1Rover) as Gauge<'instance'|'name'>
if(!gauTimeline1Rover){
		gauTimeline1Rover = new Gauge({
		name: gauTimelineName1Rover,
		help: gauTimelineName1Rover + '_help',
		labelNames: ['instance', 'name'],
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

		/* Daisy, "gauge" */

		const resDaisy = await axios.get('https://api.twitter.com/1.1/application/rate_limit_status.json?resources=search,statuses', {
			headers: {
				Authorization: `Bearer ${process.env.BEARER_TOKEN}`,
			}
		})

		const searchLimitsDaisy: RateLimit = resDaisy.data.resources.search['/search/tweets']
		const timelineLimitsDaisy: RateLimit = resDaisy.data.resources.statuses['/statuses/user_timeline']

		gauSearchDaisy.labels({ instance: 'daisy', name: 'limit' }).set(searchLimitsDaisy['limit' as keyof RateLimit])
		gauSearchDaisy.labels({ instance: 'daisy', name: 'remaining' }).set(searchLimitsDaisy['remaining' as keyof RateLimit])
		gauTimelineDaisy.labels({ instance: 'daisy', name: 'limit' }).set(timelineLimitsDaisy['limit' as keyof RateLimit])
		gauTimelineDaisy.labels({ instance: 'daisy', name: 'remaining' }).set(timelineLimitsDaisy['remaining' as keyof RateLimit])
	
		/* Rover, "gauge1" */
		
		const res1Rover = await axios.get('https://api.twitter.com/1.1/application/rate_limit_status.json?resources=search,statuses', {
			headers: {
				Authorization: `Bearer ${process.env.BEARER_TOKEN1}`,
			}
		})

		const searchLimits1Rover: RateLimit = res1Rover.data.resources.search['/search/tweets']
		const timelineLimits1Rover: RateLimit = res1Rover.data.resources.statuses['/statuses/user_timeline']

		gauSearch1Rover.labels({ instance: 'rover', name: 'limit' }).set(searchLimits1Rover['limit' as keyof RateLimit])
		gauSearch1Rover.labels({ instance: 'rover', name: 'remaining' }).set(searchLimits1Rover['remaining' as keyof RateLimit])
		gauTimeline1Rover.labels({ instance: 'rover', name: 'limit' }).set(timelineLimits1Rover['limit'])
		gauTimeline1Rover.labels({ instance: 'rover', name: 'remaining' }).set(timelineLimits1Rover['remaining'])


	}catch(e){
		logger('twitter-metrics Error', e.code, ':', e.message)
	}
}