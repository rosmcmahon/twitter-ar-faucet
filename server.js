const greenlock = require('greenlock-express')
const fs = require('fs')
const { EOL } = require('os')

// server.js
const { parse } = require('url')
// const redirectHttps = require('redirect-https')
const next = require('next')

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

function httpsWorker(glx) {
	nextApp.prepare().then(() => {

		console.log('* SERVER WAS STARTED *')
		fs.appendFile(
			'server-logs.log', 
			new Date().toUTCString() + '\t' + '* SERVER WAS STARTED *' + EOL,
			()=>{}
		)

		if(dev){
			let httpServer = glx.httpServer((req, res) => {
				const parsedUrl = parse(req.url, true)
				nextHandler(req, res, parsedUrl)
			});
			httpServer.listen(3210, "0.0.0.0", function() {
				console.info("Dev mode. Listening on ", httpServer.address(), 'http://localhost:3210');
			});
		} else {

			// Note: You must ALSO listen on port 80 for ACME HTTP-01 Challenges
			// (the ACME and http->https middleware are loaded by glx.httpServer)
			let httpServer = glx.httpServer();
			httpServer.listen(80, "0.0.0.0", function() {
				console.info("Listening on ", httpServer.address(), " but redirecting to https");
			});
			// Get the raw https server:
			let httpsServer = glx.httpsServer(null, (req, res) => {
				const parsedUrl = parse(req.url, true)
				nextHandler(req, res, parsedUrl)
			});

			httpsServer.listen(443, "0.0.0.0", function() {
				console.info("Listening on ", httpsServer.address());
			});
		}
	})
}


