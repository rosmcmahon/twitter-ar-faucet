import { UserRecord } from '../types/db-records'
import getDbConnection from '../utils/db-connection'
import { logger } from '../utils/logger'

const db = getDbConnection()

interface QueryResult {
	exists: boolean
	approved: boolean
}

interface QueryResultExt extends QueryResult {
	alreadyClaimed: boolean
}

export const checkAccountClaim = async (twitterId: string, address: string): Promise<QueryResultExt> => {

	try {
		const record = await db<UserRecord>('users').where({ twitterId })

		// Note: twitterId is a primary key in the table. Return values default to false, need to know basis
		// We could omit 'alreadyClaimed' entirely, but leaving in to test UX & bot check tolerance

		if(record.length === 1){
			if(address === record[0].address){
				return { exists: true, approved: record[0].approved, alreadyClaimed: false }
			}
			return { exists: true, approved: false, alreadyClaimed: true }
		}

		return { exists: false, approved: false, alreadyClaimed: false }

	} catch (error) {
		logger('DB error occurred')
		logger(error)
		return { exists: false, approved: false, alreadyClaimed: false }	
	}
}

export const accountClaimed = async (twitterId: string): Promise<QueryResult> => {
	try {
		const record = await db<UserRecord>('users').where({ twitterId })
		
		if(record.length === 1){
				return {
					exists: true,
					approved: record[0].approved
				}
			}
		else{
				return { exists: false, approved: false }
		}
	} catch (error) {
		logger('DB error occurred')
		logger(error)
		return { exists: false, approved: false }
	}
}