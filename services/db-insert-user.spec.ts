import next from "next"
const nextApp = next({ dev: true })
import { registerUser } from './db-insert-user'
import { UserRecord } from '../types/db-records'
import getDbConnection from '../utils/db-connection'
const db = getDbConnection()

const TEST_RECORD: UserRecord = {
	twitterId: '123', //uuid
	handle: 'TestInsert',
	date_handled: new Date().toUTCString(),
	bot_score: 5,
	address: 'search-address-1234013245678901234567890123', //length 43
	approved: false,
	reason: 'this just a test'
}

describe('claimed-check tests', () => {

	beforeAll( async () => {
		await db('users').where({ handle: TEST_RECORD.handle }).delete()
	})

	it('test that required .env constants are defined', () => {
		expect.assertions(2)
		expect(process.env.DB_USER).toBeDefined()
		expect(process.env.DB_PWD).toBeDefined()
	})

	it('tests that registerUser inserts a record', async () => {
		expect.assertions(1)
		const result = await registerUser( TEST_RECORD	)
		expect(result).toBeTruthy()
	})

	it('tests that registerUser does not insert a bad record', async () => {
		expect.assertions(1)
		const result = await registerUser({
			twitterId: '123', //duplicate
			handle: 'Dr.Bad.Record.Handle',
			address: '123', //too short
			bot_score: -1, 
			date_handled: new Date().toUTCString(), //not a date string
			approved: false,
			reason: '',
		})
		expect(result).toBeFalsy()
	})

})