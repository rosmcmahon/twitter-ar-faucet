import { Button, CircularProgress, Typography } from '@material-ui/core'
import Axios from 'axios'
import React, { useEffect, useState } from 'react'
import { EnquiryData } from '../types/api-responses'
import { logger } from '../utils/logger'

const sleep = async (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms))

interface IProps {
	onClickNext: React.MouseEventHandler<HTMLButtonElement>
	address: string
}

const Spinner = ({onClickNext, address}: IProps) => {
	const [disableNext, setDisableNext] = useState(true)
	const [statusMessage, setStatusMessage] = useState('Searching for Twitter post...')
	const [waitMs, setWaitMs] = useState(0)

	useEffect( () => {
		let tries = 7
		let sleepMs = 5000 //(sleepMs*2 <= 315000) // 6 tries over 5'15s
		let rateLimitWait = 0

		const timercode = async () => {
			while(tries--){

				let res = await Axios.get('/api/enquiry', {
					params: {
						address: address
					}
				})
				if(typeof res.data.error !== 'undefined'){
					logger('spinner', 'Enquiry Error', res.data.error)
				}
			
				let data: EnquiryData = res.data

				if(data.processed){
					logger('spinner', 'processed', data)
					
					if(data.alreadyClaimed){
						setStatusMessage(data.handle! + ' has already claimed free tokens')
						break;
					}
					if(data.approved === false){
						setStatusMessage('Beep boop! We do not serve bots')
						break;
					}

					setStatusMessage('Welcome ' + data.handle! + '! Click next to continue')
					setDisableNext(false)
					break;
				} 

				if(tries === 0){
					setStatusMessage('Giving up searching for the Tweet')
					break
				}

				logger('spinner', 'not processed yet', data)

				/* adjust wait timer */

				let waitTime = sleepMs + data.waitTime
				logger('spinner', address, 'waiting another', waitTime, 'ms...')
				setStatusMessage('Searching for tweet ' + waitTime + 'ms')

				await sleep(waitTime) 

				// Adjust sleep timers for the next attempt
				sleepMs *= 2

			}
		}
		timercode()

		return () => {
			tries = 0
		}
	}, [])

	return (
		<>
			<Typography variant='h2'>{statusMessage}</Typography>
			<CircularProgress size={100} thickness={3.6} /><br/>
			{/* <CircularProgress size={100} thickness={3.6} variant='determinate' value={100} /><br/> */}
			<Button disabled={disableNext} variant='contained' onClick={onClickNext}>Next</Button>
		</>
	)
}
export default Spinner

