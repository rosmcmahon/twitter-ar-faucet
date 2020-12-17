import next from "next"
const nextApp = next({ dev: true })
import { getTweetHandle } from './tweet-search'

describe('tweet-search.ts tests', () => {

	it('test that BEARER_TOKEN is defined', () => {
		expect.assertions(1)
		expect(process.env.BEARER_TOKEN).toBeDefined()
	})

	it('tests handle is returned for valid search', async () => {
		expect.assertions(3)

		/**
		 * The Twitter API only returns search results from the 
		 * last 7 days so you might needs to send some new Tweets
		 */
		const address = 'U5p5oWnzTrs2-4nmd4VWkpxoTSHQOukWtGqq27-zWnw' // @RodSchuffler

		const result = await getTweetHandle(address)

		expect(result.value).toEqual(true)
		expect(result.handle.length).toBeGreaterThan(0)
		expect(result.handle).toEqual('RodSchuffler')

	}, 20000)

	it('tests no handle is returned for invalid search', async () => {
		expect.assertions(2)

		const invalidSearch = '929de249-87ce-4216-b587-3e3d53a67001' // a uuid

		const result = await getTweetHandle(invalidSearch)

		expect(result.value).toBeFalsy()
		expect(result.handle.length).toBe(0)

	}, 20000)

})