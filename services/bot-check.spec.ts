import next from "next"
const nextApp = next({ dev: true })
import { botCheck } from './bot-check'



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
		const result = await botCheck('rosmcmahon_real')
		expect(result.passed).toBeFalsy()
	})

	it('tests known bot @wayback_exe is a bot', async () => {
		expect.assertions(1)
		const result = await botCheck('wayback_exe')
		expect(result.passed).toBeTruthy()
	})

	it('tests known bot @RodSchuffler is a bot', async () => {
		expect.assertions(1)
		const result = await botCheck('RodSchuffler')
		expect(result.passed).toBeTruthy()
	})



})