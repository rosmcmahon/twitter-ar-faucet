import axios from "axios"

let _last = 0
let _cached = 0
export const getArPrice = async()=> {
	const now = new Date().valueOf()
	const diff = now - _last
	if(diff > 60*1000){
		_last = now
		try{
			_cached = (await axios.get('https://api.coingecko.com/api/v3/simple/price?ids=arweave&vs_currencies=usd')).data.arweave.usd
		}catch(e){} //do not stop for errors
	}
	return _cached
}
