import next from "next"
const nextApp = next({ dev: true })
import { getTweetData } from './tweet-search'
import { sendFailTweetReply, sendSuccessTweetReply } from "./twitter-reply"

//@ts-ignore
describe('twitter-reply.ts tests', () => {

	//@ts-ignore
	it('test that BEARER_TOKEN is defined', () => {
		//@ts-ignore
		expect.assertions(1)
		//@ts-ignore
		expect(process.env.BEARER_TOKEN).toBeDefined()
	})
	
	//@ts-ignore
	it('tests we can ad a reply to another user\'s tweet', async () => {
		//@ts-ignore
		expect.assertions(1)
		
		const result = await sendFailTweetReply('1351967174697562121', 'Rod')
		
		//@ts-ignore
		expect(result).toEqual(true)

	}, 20000)

	//@ts-ignore
	it('returns false when the tweet has been deleted', async () => {
		//@ts-ignore
		expect.assertions(1)

		const result = await sendSuccessTweetReply('1365321081695961088', 'Robot Pusher')

		//@ts-ignore
		expect(result).toEqual(false)

	}, 20000)



})