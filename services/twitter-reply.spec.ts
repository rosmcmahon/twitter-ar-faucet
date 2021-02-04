import next from "next"
const nextApp = next({ dev: true })
import { getTweetData } from './tweet-search'
import { sendFailTweetReply, sendSuccessTweetReply } from "./twitter-reply"

describe('twitter-reply.ts tests', () => {

	it('test that BEARER_TOKEN is defined', () => {
		expect.assertions(1)
		expect(process.env.BEARER_TOKEN).toBeDefined()
	})

	it('tests we can ad a reply to another user\'s tweet', async () => {
		expect.assertions(1)

		const result = await sendFailTweetReply('1351967174697562121', 'Rod')

		expect(result).toEqual(true)

	}, 20000)



})