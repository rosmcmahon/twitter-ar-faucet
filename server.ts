import greenlock from 'greenlock-express'
import { parse } from 'url'
import next from 'next'
import http, { IncomingMessage, ServerResponse } from 'http'
import { logger } from './utils/logger'
import { register } from 'prom-client'
import { updateTwitterMetrics } from './utils/twitter-metrics'

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
	const { pathname } = parsedUrl

	// if(pathname === '/metrics'){
	// 	res.writeHead(200, { 'Content-Type': 'text/plain'})
	// 	res.end(await register.metrics())
	// }
	
	nextHandler(req, res) //, parsedUrl)
}

function httpsWorker(glx: greenlock.glx) {
	nextApp.prepare().then(() => {

		logger('* SERVER STARTING UP *')

		const httpMetrics = http.createServer(async(req: IncomingMessage, res: ServerResponse) => {
			const parsedUrl = parse(req.url!, true)
			const { pathname } = parsedUrl
		
			if(pathname === '/metrics'){
				res.writeHead(200, { 'Content-Type': 'text/plain'})
				await updateTwitterMetrics()
				res.end(await register.metrics())
			}
		})
		httpMetrics.listen(9100, "0.0.0.0", ()=> console.info('metrics on http://localhost:9100/metrics'))

		if(dev){
			const httpDev = http.createServer(mainHandler)

			httpDev.listen(3210, "0.0.0.0", ()=> {
				console.info("Dev mode. Listening on ", httpDev.address(), 'http://localhost:3210')
			})
		} else {

			// Note: You must ALSO listen on port 80 for ACME HTTP-01 Challenges
			// (the ACME and http->https middleware are loaded by glx.httpServer)
			const httpServer = glx.httpServer()
			httpServer.listen(80, "0.0.0.0", ()=> {
				console.info("Listening on ", httpServer.address(), " but redirecting to https")
			})

			const httpsServer = glx.httpsServer(null, mainHandler)
			httpsServer.listen(443, "0.0.0.0", function() {
				console.info("Listening on ", httpsServer.address())
			})
		}
	})
}


