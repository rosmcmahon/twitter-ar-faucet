export type EnquiryData = {
	processed: boolean
	approved: boolean
	rateLimitWait: number
	alreadyClaimed: boolean

} //| { error: string }

export type HeartbeatData = {
	isOk: boolean
}