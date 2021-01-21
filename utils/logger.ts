import col from 'ansi-colors'
// import fs from 'fs'
let fs: any
if(typeof window === 'undefined'){ fs = require('fs') }

let DEBUG_MESSAGES = true
export const setDebugMessagesOn = (b: boolean) => DEBUG_MESSAGES = b

export const logger = (...args: any[]) => {
	if(DEBUG_MESSAGES){
		let prefix = '[logger]'
		if(args.length > 1){
			prefix = '[' + args[0] + ']'
			args.shift()
		}
		if (typeof window === 'undefined') {
			// output on server
			console.log(col.magenta(prefix), ...args)
			fs.appendFile(
				'server-logs.log', 
				new Date().toUTCString() + '\t' + args.join(' '),
				()=>{}
			)
		}else{
			// output to browser console
			console.log('%c' + prefix, 'color: #FF00ff', ...args)
		}
	}
}