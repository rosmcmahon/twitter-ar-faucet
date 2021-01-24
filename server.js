const http = require('http')
const https = require('https')
const fs = require('fs')
const { parse } = require('url')
const next = require('next')

const httpsOptions = {
	key: fs.readFileSync('/etc/letsencrypt/live/arweavewallet.com/privkey.pem'),
	cert: fs.readFileSync('/etc/letsencrypt/live/arweavewallet.com/fullchain.pem')
}

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const nextHandler = app.getRequestHandler()


app.prepare().then(() => {
	// let httpServer = http.createServer((req, res)=>{
	// 	res.
	// })
	// httpServer.listen(80, () => console.log('Ready on http://localhost:80'))

	let httpsServer = https.createServer(httpsOptions, (req, res) => {
    const parsedUrl = parse(req.url, true);
    nextHandler(req, res, parsedUrl);
  })
	httpsServer.listen(443, (err) => {
		if(err) throw err;
		console.log('Ready on https://localhost:443')
	})
})