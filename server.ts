import greenlock from 'greenlock-express'
import { parse } from 'url'
import next from 'next'
import { IncomingMessage, ServerResponse } from 'http'
import { logger } from './utils/logger'

const dev = process.env.NODE_ENV !== 'production'
const nextApp = next({ dev })
const nextHandler = nextApp.getRequestHandler()

greenlock
	.init({
		packageRoot: __dirname,
		configDir: './greenlock-manager',
		maintainerEmail: 'ros@arweave.org',
		cluster: false,
	})
	.ready(httpsWorker)

const mainHandler = async (req: IncomingMessage, res: ServerResponse) => {
	const parsedUrl = parse(req.url!, true)
	const { pathname, /*query*/ } = parsedUrl

	// if(dev){ // need some kind of authentication for production
	// 	if(pathname === '/metrics'){
	// 		res.writeHead(200, { 'Content-Type': 'text/plain'})
	// 		res.end(await register.metrics())
	// 	}
	// }
	
	nextHandler(req, res) //, parsedUrl)
}

function httpsWorker(glx: greenlock.glx) {
	nextApp.prepare().then(() => {

		logger('* SERVER WAS STARTED *')

		if(dev){
			let httpServer = glx.httpServer(mainHandler)

			httpServer.listen(3210, "0.0.0.0", function() {
				console.info("Dev mode. Listening on ", httpServer.address(), 'http://localhost:3210')
			});
		} else {

			// Note: You must ALSO listen on port 80 for ACME HTTP-01 Challenges
			// (the ACME and http->https middleware are loaded by glx.httpServer)
			let httpServer = glx.httpServer();
			httpServer.listen(80, "0.0.0.0", function() {
				console.info("Listening on ", httpServer.address(), " but redirecting to https")
			});
			// Get the raw https server:
			let httpsServer = glx.httpsServer(null, mainHandler)

			httpsServer.listen(443, "0.0.0.0", function() {
				console.info("Listening on ", httpsServer.address())
			});
		}
	})
}


