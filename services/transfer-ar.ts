import Arweave from 'arweave'

const arweave = Arweave.init({ host: 'arweave.net' })

export const transferAr = async (target: string) => {
	const jwk = require('../secrets/jwk.json')
	let fee = await arweave.transactions.getPrice(1, target)
	console.log('WALLET_GEN_FEE', fee)
	let tx = await arweave.createTransaction({
		target: target,
		quantity: arweave.ar.arToWinston("0.1"),
	}, jwk)
	await arweave.transactions.sign(tx, jwk)
	// let res = await arweave.transactions.post(tx)
	let status = await arweave.transactions.getStatus(tx.id)
	console.log(`Transaction ${tx.id} status code is ${status.status}`)

	/* TODO: implenent a whole retry post tx scenario */

	return tx.id
}