

let fifo: string[] = []
const MAX_SIZE = 200

export const storeIP = (ip: string) => {
	// convert from "::ffff:192.0.0.1"  to "192.0.0.1"
	if (ip.startsWith("::ffff:") ) {
    ip = ip.substring(7)
	}
	
	if(fifo.includes(ip)){
		return;
	}

	fifo.push(ip)

	if(fifo.length > MAX_SIZE){
		fifo.shift()
	}
}

export const checkIP = (ip: string) => {
	if (ip.startsWith("::ffff:")) {
    ip = ip.substring(7)
	}
	if(fifo.includes(ip)){
		fifo = fifo.filter(item => item !== ip) //remove ip
		return true
	}
	return false
}