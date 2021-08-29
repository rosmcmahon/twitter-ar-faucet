require('dotenv').config()
import greenlock from 'greenlock-express'
import { parse } from 'url'
import next from 'next'
import http, { IncomingMessage, ServerResponse } from 'http'
import { logger } from './utils/logger'
import { register } from 'prom-client'
import { updateTwitterMetrics } from './utils/twitter-metrics'
import { slackLogger } from './utils/slack-logger'
import expressRateLimit from 'express-rate-limit'

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

const ipLimiter = expressRateLimit({
	windowMs: 15 * 60 * 1000,
	max: 10,
	headers: false,
})

const mainHandler = async (req: IncomingMessage, res: ServerResponse) => {
	const parsedUrl = parse(req.url!, true)
	const { pathname } = parsedUrl

	if(pathname === '/steps'){
		const ipAddress = req.socket.remoteAddress
		await new Promise((resolve, reject)=>{
			const fakeRes = Object.assign({
				status: function(n: number){ res.statusCode = n; return this},
				send: (msg: string)=>{ 
					res.writeHead(429)
					res.end('<h1>Sorry, too many attempts. Please come back later.</h1>')
					logger(ipAddress, 'this ip was rate-limited in the Steps route')
				}
			}, res)
			ipLimiter(req as any, fakeRes as any, (result: any)=>{
				if(result instanceof Error){
					return reject(result)
				}
				return resolve(result)
			})
		})
	}
	
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

			slackLogger('⚠️ Server Restarted ⚠️')

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


