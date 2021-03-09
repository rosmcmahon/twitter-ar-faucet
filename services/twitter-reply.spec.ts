import next from "next"
const nextApp = next({ dev: true })
import { sendFailTweetReply, sendSuccessTweetReply } from "./twitter-reply"

describe('twitter-reply.ts tests', () => {

	it('test that BEARER_TOKEN is defined', () => {
		expect.assertions(1)
		expect(process.env.BEARER_TOKEN).toBeDefined()
	})
	
	it('tests we can ad a reply to another user\'s tweet', async () => {
		expect.assertions(1)
		
		const result = await sendFailTweetReply('1351967174697562121', 'Rod')
		
		console.log(result)

		expect(result).toBeDefined()

	}, 20000)

	it('returns false when the tweet has been deleted', async () => {
		expect.assertions(1)

		const result = await sendSuccessTweetReply('1369299625719590915', 'Robot Pusher')

		expect(result).toEqual('error: could not attach reply')

	}, 20000)

})