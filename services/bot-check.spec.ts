import next from "next"
const nextApp = next({ dev: true })
import { isBot } from './bot-check'



describe('bot-check test', () => {

	it('test that required .env constants are defined', () => {
		expect.assertions(5)

		expect(process.env.TWITTER_API_KEY).toBeDefined()
		expect(process.env.TWITTER_API_SECRET).toBeDefined()
		expect(process.env.TWITTER_ACCESS_TOKEN).toBeDefined()
		expect(process.env.TWITTER_ACCESS_SECRET).toBeDefined()
		expect(process.env.RAPID_KEY).toBeDefined()
	})


	it('tests non-bot @rosmcmahon_real is not a bot', async () => {
		expect.assertions(1)
		const result = await isBot('rosmcmahon_real')
		expect(result.value).toBeFalsy()
	})

	it('tests known bot @wayback_exe is a bot', async () => {
		expect.assertions(1)
		const result = await isBot('wayback_exe')
		expect(result.value).toBeTruthy()
	})

	it('tests known bot @RodSchuffler is a bot', async () => {
		expect.assertions(1)
		const result = await isBot('RodSchuffler')
		expect(result.value).toBeTruthy()
	})



})