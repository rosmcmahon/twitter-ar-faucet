import axios from 'axios'
import { HeartbeatData } from '../types/api-responses'

export const heartbeatOK = async() => {
	return (await axios.get<HeartbeatData>('/api/heartbeat')).data.isOk
}