import { Botometer } from 'botometer'


let _botometers: Botometer[] = []

export const getBotometer = () => {
	//if first run load all credentials from .env file
	if(_botometers.length === 0){
		load()
	}
	//split the load by rotating a queue. shift(pop) head and push to tail of queue
	// if we encounter "concurrency" issue, it will be down to this operation
	const x = _botometers.shift()
	if(x === undefined) throw new Error('no TwitterLiteEntry found.')
	_botometers.push(x)
	
	return x
}

const load = () =>{
	if(
		!process.env.RAPID_KEY
		|| !process.env.TWITTER_API_KEY
		|| !process.env.TWITTER_API_SECRET
		|| !process.env.TWITTER_ACCESS_TOKEN
		|| !process.env.TWITTER_ACCESS_SECRET
		|| !process.env.TWITTER_API_KEY1
		|| !process.env.TWITTER_API_SECRET1
		|| !process.env.TWITTER_ACCESS_TOKEN1
		|| !process.env.TWITTER_ACCESS_SECRET1
	) throw new Error('Some key process.env.* is undefined. Check the .env file')

	// load .env entries individually, as arrays not supported

	//create botometer0 object
	const botometer = new Botometer({
		consumerKey: process.env.TWITTER_API_KEY,
		consumerSecret: process.env.TWITTER_API_SECRET,
		accessToken: process.env.TWITTER_ACCESS_TOKEN,
		accessTokenSecret: process.env.TWITTER_ACCESS_SECRET,
		rapidApiKey: process.env.RAPID_KEY,
		supressLogs: false,
		usePro: true,
	});

	_botometers.push(botometer)

	//create botometer1 object
	const botometer1 = new Botometer({
		consumerKey: process.env.TWITTER_API_KEY1,
		consumerSecret: process.env.TWITTER_API_SECRET1,
		accessToken: process.env.TWITTER_ACCESS_TOKEN1,
		accessTokenSecret: process.env.TWITTER_ACCESS_SECRET1,
		rapidApiKey: process.env.RAPID_KEY,
		supressLogs: false,
		usePro: true,
	});

	_botometers.push(botometer1)

	// etc...

}