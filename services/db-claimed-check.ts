import { UserRecord } from '../types/db-records'
import getDbConnection from '../utils/db-connection'
import { logger } from '../utils/logger'

const db = getDbConnection()

interface QueryResult {
	exists: boolean
	approved: boolean
}

export const isProcessed = async (address: string): Promise<QueryResult> => {
	return valueExists({ address })
}


export const handleClaimed = async (handle: string): Promise<QueryResult> => {
	return valueExists({ handle })
}

export const checkHandleClaim = async (handle: string, address: string): Promise<QueryResult> => {

	const handleRec = await valueExists({ handle })
	const addressRec = await valueExists({ handle, address })

	if(handleRec.exists && !addressRec.exists){
		return {
			exists: true,
			approved: false, //dummy
		}
	}

	return {
		exists: false,
		approved: false, //dummy
	}
}

const valueExists = async (value: object): Promise<QueryResult> => {
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
				logger('DB Error', 'valueUsed result out of bounds', value)
				return { exists: false, approved: false }
		}
	} catch (error) {
		logger('An DB error occurred')
		logger(error)
		return { exists: false, approved: false }
	}
}