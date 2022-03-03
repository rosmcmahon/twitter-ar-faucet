/* N.B. The TwitterRateLimit is not accessible on the frontend, use the API */
let cachedTwitterReset = 0; 

/**
 * Keep the Twitter rate-limit-reset in a global singleton
 * @param newReset timestamp from Number(res.headers['x-rate-limit-reset'])
 */
export const currentTwitterReset = (newReset: number = 0) => {
	if(newReset > cachedTwitterReset){
		cachedTwitterReset = newReset
		return cachedTwitterReset;
	}

	if(cachedTwitterReset !== 0){
		let now =  new Date().valueOf() / 1000 
		if(now < cachedTwitterReset){
			return cachedTwitterReset;
		}
		cachedTwitterReset = 0
	}
	return cachedTwitterReset;
}

/**
 * Returns the current twitter rate-limit wait in milliseconds
 */
export const getRateLimitWait = () => {
	if(cachedTwitterReset === 0){
		return 0;
	}
	return new Date( currentTwitterReset() * 1000 ).valueOf() - new Date().valueOf()
}

