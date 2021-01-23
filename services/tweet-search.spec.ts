import next from "next"
const nextApp = next({ dev: true })
import { getTweetData } from './tweet-search'

describe('tweet-search.ts tests', () => {

	it('test that BEARER_TOKEN is defined', () => {
		expect.assertions(1)
		expect(process.env.BEARER_TOKEN).toBeDefined()
	})

	it('tests handle is returned for valid search', async () => {
		expect.assertions(4)

		/**
		 * The Twitter API only returns search results from the 
		 * last 7 days so you might needs to send some new Tweets
		 */
		const address = 'test20210120' // @RodSchuffler

		const result = await getTweetData(address)

		expect(result.value).toEqual(true)
		expect(result.handle).toEqual('RodSchuffler')
		expect(result.twitterId).toEqual('1324287567991328768')
		expect(result.tweetId).toEqual('1351967174697562121')

	}, 20000)

	it('tests no handle is returned for invalid search', async () => {
		expect.assertions(1)

		const invalidSearch = '929de249-87ce-4216-b587-3e3d53a67001' // a uuid

		const result = await getTweetData(invalidSearch)

		expect(result.value).toBeFalsy()

	}, 20000)

	it('tests search terms starting with \'-\' are handled', async () => {
		expect.assertions(1)

		const invalidSearch = '-929de249-87ce-4216-b587-3e3d53a67001' // a uuid

		const result = await getTweetData(invalidSearch)

		expect(result.value).toBeFalsy()

	}, 20000)

})