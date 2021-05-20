import Arweave from 'arweave'
import { slackLogger } from './slack-logger'


// const gauJwkName = metricPrefix + 'jwk_balance_gauge'
// let gauJwk = register.getSingleMetric(gauJwkName) as Gauge<'balance'>
// if(!gauJwk){
// 	gauJwk = new Gauge({
// 		name: gauJwkName,
// 		help: gauJwkName + '_help',
// 		labelNames: ['balance'],
// 	})
// }

const arweave = Arweave.init({ host: 'arweave.net' })
const jwk = require('../secrets/jwk.json')

let _lastUpdate = 0
const UPDATE_DIFF = 5 * 60 * 1000

export const checkJwkBalance = ()=> {
	const now = new Date().valueOf() //ms
	if((now - _lastUpdate) > UPDATE_DIFF){
		_lastUpdate = now
		update()
	}
}

const update = async()=> {
	try{
		const address = await arweave.wallets.getAddress(jwk)
		const winston = await arweave.wallets.getBalance(address)
		const ar = Number(arweave.ar.winstonToAr(winston))
		if(ar < 20.0){
			slackLogger('Faucet wallet balance has fallen to', ar, 'AR. Consider topping up soon.')
		}
		
	}catch(e){
		slackLogger('wallet-monitor error', e.code, ':', e.message)
	}
}