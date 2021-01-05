import Arweave from 'arweave'

const arweave = Arweave.init({ host: 'arweave.net' })

export const transferAr = async (target: string) => {
	const jwkPot = require('../secrets/jwk.json')
	let fee = await arweave.transactions.getPrice(0, target)
	console.log('WALLET_GEN_FEE', fee,'winston', arweave.ar.winstonToAr(fee), 'AR')
	let tx = await arweave.createTransaction({
		target: target,
		quantity: arweave.ar.arToWinston("0.1"),
	}, jwkPot)
	await arweave.transactions.sign(tx, jwkPot)
	// let res = await arweave.transactions.post(tx)
	let status = await arweave.transactions.getStatus(tx.id)
	console.log(`Transaction ${tx.id} status code is ${status.status}`)

	/* TODO: implenent a whole retry post tx scenario */

	return tx.id
}