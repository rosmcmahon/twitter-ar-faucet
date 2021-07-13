import Arweave from 'arweave'
import { uploadTx } from 'arweave-uploader'
import { REWARD_AR } from '../utils/constants'
import { logger } from '../utils/logger'
import { slackLogger } from '../utils/slack-logger'

const arweave = Arweave.init({ host: 'arweave.net', timeout: 60000 })

export const transferAr = async (address: string) => {
	try {
		const jwk = require('../secrets/jwk.json')
		let fee = await arweave.transactions.getPrice(0, address)
		logger(address, 'WALLET_GEN_FEE', fee,'winston', arweave.ar.winstonToAr(fee), 'AR')
		let tx = await arweave.createTransaction({
			target: address,
			quantity: arweave.ar.arToWinston(REWARD_AR),
		}, jwk)
		tx.addTag('App-Name', 'twitter-cannon')

		/* TODO: implement a whole retry post tx scenario */
		/* We did the above and created a library for it as it became such an issue */

		const txid = await uploadTx(tx, jwk, address)
		logger(address, 'AR transfer success. txid:', txid)
	} catch (e) {
		logger(address, 'Possible AR transfer failure.', e.name, ':', e.message)
		slackLogger(`Address <https://viewblock.io/arweave/address/${address}|${address}>`, '*Possible* AR transfer failure.', e.name, ':', e.message)
		console.log(e)
	}
}