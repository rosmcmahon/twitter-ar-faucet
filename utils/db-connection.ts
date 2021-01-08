import knex from 'knex'
import { logger } from './logger';

let cachedConnection: knex<any, unknown[]>

export default () => {
  if (cachedConnection) {
    logger("using cached db connection");
    return cachedConnection;
  }

	logger("creating new db connection");
	const connection = knex({
		client: 'pg',
		connection: {
			host: '127.0.0.1',
			user: process.env.DB_USER,
			password: process.env.DB_PWD,
			database: 'twittercannon',
		}
	})
  cachedConnection = connection;
  return connection;
};
