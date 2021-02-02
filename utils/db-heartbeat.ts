import getDbConnection from './db-connection'
const { heartbeatChecker } = require('knex-utils')


const db = getDbConnection()

export const getDbHeartbeat = async (): Promise<boolean> => {
	const check = await heartbeatChecker.checkHeartbeat(db, heartbeatChecker.HEARTBEAT_QUERIES.POSTGRESQL)
	return check.isOk
}
