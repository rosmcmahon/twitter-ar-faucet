import Arweave from 'arweave'
import { uploadTx } from 'arweave-uploader'
import { logger } from '../utils/logger'

const arweave = Arweave.init({ host: 'arweave.net' })

export const transferAr = async (address: string) => {
	const jwk = require('../secrets/jwk.json')
	let fee = await arweave.transactions.getPrice(0, address)
	logger(address, 'WALLET_GEN_FEE', fee,'winston', arweave.ar.winstonToAr(fee), 'AR')
	let tx = await arweave.createTransaction({
		target: address,
		quantity: arweave.ar.arToWinston("0.1"),
	}, jwk)
	tx.addTag('App-Name', 'twitter-cannon')

	/* TODO: implenent a whole retry post tx scenario */
	/* We did the above and created a library for it as it became such an issue */

	try {
		const txid = await uploadTx(tx, jwk)
		logger(address, 'AR transfer success. txid:', txid)
	} catch (e) {
		logger(address, 'AR transfer failure.', e.name, ':', e.message)
		console.log(e)
	}
}