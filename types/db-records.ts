declare type utcString = string

export interface UserRecord {
	handle: string
	date_handled: utcString // myDate.toUTCString()
	bot_score: number
	address: string
	approved: boolean
	reason: string
}

export interface BlacklistRecord {
	ip: string
	timesBlocked: number
}