import next from "next"
const nextApp = next({ dev: true })
import { accountClaimed, isProcessed } from './db-claimed-check'

describe('claimed-check tests', () => {

	it('test that required .env constants are defined', () => {
		expect.assertions(2)
		expect(process.env.DB_USER).toBeDefined()
		expect(process.env.DB_PWD).toBeDefined()
	})

	it('tests that isProcessed finds correct record', async () => {
		expect.assertions(2)
		const result = await isProcessed(
			'mr_robot-address123412345678901234567890123'
		)
		expect(result.exists).toBeTruthy()
		expect(result.approved).toBeFalsy()
	})

	it('tests that isProcessed returns record not found', async () => {
		expect.assertions(1)
		const result = await isProcessed('nonexistent-address')
		expect(result.exists).toBeFalsy()
	})

	it('tests that handleUsed finds correct record', async () => {
		expect.assertions(2)
		const result = await accountClaimed('Mr_Robot')
		expect(result.exists).toBeTruthy()
		expect(result.approved).toBeFalsy()
	})

	it('tests that handleUsed returns record not found', async () => {
		expect.assertions(1)
		const result = await accountClaimed('nonexistent-handle')
		expect(result.exists).toBeFalsy()
	})

})
