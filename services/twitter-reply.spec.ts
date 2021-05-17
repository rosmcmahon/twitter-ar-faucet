require('dotenv').config() //first line of entrypoint
// import next from "next"
// const nextApp = next({ dev: true })
import { sendFailTweetReply, sendSuccessTweetReply } from "./twitter-reply"

describe('twitter-reply.ts tests', () => {

	it('test that BEARER_TOKEN is defined', () => {
		expect.assertions(1)
		expect(process.env.BEARER_TOKEN).toBeDefined()
	})
	
	it('tests we can ad a reply to another user\'s tweet', async () => {
		expect.assertions(4)
		
		// https://twitter.com/Robotpusher/status/1393225398733860867
		const result0 = await sendFailTweetReply('1393225398733860867', 'reply0 to Robot Pusher')
		const result1 = await sendFailTweetReply('1393225398733860867', 'reply1 to Robot Pusher')
		const result2 = await sendFailTweetReply('1394359664456966152', 'reply2 to Robot Pusher')
		const result3 = await sendFailTweetReply('1394359664456966152', 'reply3 to Robot Pusher')
		
		console.log(result0)
		console.log(result1)
		console.log(result2)
		console.log(result3)

		expect(result0.length).toBe(19)
		expect(result1.length).toBe(19)
		expect(result2.length).toBe(19)
		expect(result3.length).toBe(19)

	}, 20000)

	it('returns false when the tweet has been deleted', async () => {
		expect.assertions(1)

		const result = await sendSuccessTweetReply('1369299625719590915', 'Robot Pusher')

		expect(result).toEqual('error: could not attach reply')

	}, 20000)

})