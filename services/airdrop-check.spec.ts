require('dotenv').config({path: '.env.user.rosmcmahon_real'}) //first line of entrypoint
import { airdropCheck } from './airdrop-check'

const handles = [
	{ twitterHandle: 'Shoe559', twitterId: '190689000' },
	// { twitterHandle: 'Nehasha69000522', twitterId: '1288116767085088768' },
	{ twitterHandle: 'HusnaKhaza', twitterId: '1024915012706480128' },
	{ twitterHandle: 'NguyenT02063389', twitterId: '1223829448962625539' },
	{ twitterHandle: 'HNoverz', twitterId: '468848631' },
	{ twitterHandle: 'kheniichi', twitterId: '1023218491' },
	{ twitterHandle: 'Said1922_', twitterId: '929074734037319680' },
	{ twitterHandle: 'gama_ran', twitterId: '1239857850119098368' },
	{ twitterHandle: 'yhahaha_hayukk', twitterId: '1149830620803059712' },
	{ twitterHandle: 'r3lzdrops', twitterId: '403475616' },
	{ twitterHandle: 'kalpeshdave255', twitterId: '741923463959482368' },
	{ twitterHandle: 'MSanchezWorld', twitterId: '37907055' }, //many followers
]

describe('./airdrop-check.ts test', ()=> {

	it('test that BEARER_TOKENs are defined', ()=>{
		expect.assertions(2)
		expect(process.env.BEARER_TOKEN).toBeDefined()
		expect(process.env.BEARER_TOKEN1).toBeDefined()
	})

	it('test that we get airdrop counts', async()=>{
		expect.assertions(1)

		// const count = await airdropCheck('Anonimbaee', '1074650536819884032') // replies to airdrop tweets
		const res = await airdropCheck('MSanchezWorld', '37907055')
		console.log('results', res)
		expect(typeof res!.count).toBe('number')
		
	}, 100000)

	// it('test that we get airdrop counts', async()=>{
	// 	expect.assertions(handles.length)

	// 	for (const handle of handles) {
	// 		const count = await airdropCheck(handle.twitterHandle, handle.twitterId)
	// 		console.log(handle.twitterHandle, count)
	// 		expect(typeof count).toBe('number')
	// 	}

	// }, 100000)

})