import next from "next"
const nextApp = next({ dev: true })
require('dotenv').config()

import { slackLogger } from './slack-logger'



describe('slack logging tests', () => {

	it('test that required .env constants are defined', () => {
		expect.assertions(1)

		expect(process.env.SLACK_WEBHOOK).toBeDefined()
	})

	it('sends a test message to Slack', async () => {
		expect.assertions(1)


		await slackLogger('this is just a <https://arweave.net/|markdown test>')


		expect(true).toBeTruthy()
	})

})