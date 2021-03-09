import next from "next"
import { BotCheckResult } from "../services/bot-check"
const nextApp = next({ dev: true })
import { logToSlack } from './slack-logger'



describe('slack logging tests', () => {

	it('test that required .env constants are defined', () => {
		expect.assertions(1)

		expect(process.env.SLACK_WEBHOOK).toBeDefined()
	})

	it('sends a test message to Slack', async () => {
		expect.assertions(1)

		const claimData = {
			twitterId: '123',
			handle: 'mr.mcgee',
			address: 'abc-43',
			approved: true,
			bot_score: 2.1,
			reason: 'ok',
			date_handled: new Date().toUTCString(), 
		}

		const botResult: BotCheckResult = {
			botScore: 4.2,
			passed: false,
			reason: "account too young"
		}


		const result = await logToSlack("handle_name", "123", "abc=43", botResult, '1369027886624149505')
		expect(result).toBeTruthy()
	})

})