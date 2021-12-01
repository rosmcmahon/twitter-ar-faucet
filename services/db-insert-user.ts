import { UserRecord } from '../types/db-records'
import getDbConnection from '../utils/db-connection'
import { logger } from '../utils/logger'

const db = getDbConnection()

export const registerUser = async (record: UserRecord) => {
	try {
		let result: any = await db<UserRecord>('users').insert(record)

		if(result.rowCount && result.rowCount !== 1 ){
			logger('updated rowCount =', result.rowCount)
			return false
		}
		return true
		
	} catch (e:any) {
		logger('An error occurred in registerUser')
		if(e.code && Number(e.code) === 23505){
			logger('Duplicate key value violates unique constraint', e.detail)
		} else {
			logger(e)
		}
		return false
	}
}