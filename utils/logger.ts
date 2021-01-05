import col from 'ansi-colors'

let DEBUG_MESSAGES = true
export const setDebugMessagesOn = (b: boolean) => DEBUG_MESSAGES = b

export const logger = (...args: any[]) => {
	if(DEBUG_MESSAGES){
		let prefix = '[logger:]'
		if(args.length > 1){
			prefix = '[' + args[0] + ':]'
			args.shift()
		}
		if (typeof window === 'undefined') {
			console.log(col.blue(prefix), ...args)
		}else{
			console.log('%c' + prefix, 'color: #0000ff', ...args)
		}
	}
	//TODO: add filewrite(logfile.log) here with timestamps
}