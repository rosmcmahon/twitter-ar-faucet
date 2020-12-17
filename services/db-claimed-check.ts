import { UserRecord } from '../types/db-records'
import getDbConnection from '../utils/db-connection'
import { logger } from '../utils/logger'

const db = getDbConnection()

interface QueryResult {
	exists: boolean
	approved: boolean
}

export const isProcessed = async (address: string): Promise<QueryResult> => {
	return valueUsed({ address })
}


export const handleUsed = async (handle: string): Promise<QueryResult> => {
	return valueUsed({ handle })
}

const valueUsed = async (value: object): Promise<QueryResult> => {
	try {
		let record = await db<UserRecord>('users').where(value)
		
		switch (record.length) {
			case 1:
				return {
					exists: true,
					approved: record[0].approved
				}
			case 0:
				return { exists: false, approved: false }
			default:
				logger('Error: valueUsed result out of bounds', value)
				return { exists: false, approved: false }
		}
	} catch (error) {
		logger('An error occurred')
		logger(error)
		return { exists: false, approved: false }
	}
}