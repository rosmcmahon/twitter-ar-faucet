import { LinearProgress, useTheme } from '@material-ui/core'
import Axios from 'axios'
import React, { useEffect, useRef, useState } from 'react'
import { EnquiryData } from '../types/api-responses'
import { logger } from '../utils/logger'

const sleep = async (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms))

interface IProps {
	address: string
	seconds: number //ms
	setProcessed: (b: boolean) => void
}

const SpinnerStep = ({address, seconds, setProcessed}: IProps) => {

	const theme = useTheme()
	const [statusMessage, setStatusMessage] = useState('Searching for Twitter post...')

	const waitTime = useRef(0)
	const nextTime = useRef(0)
	const [isProcessing, setIsProcessing] = useState(true)

	// useEffect, run once 
	useEffect(() => {
		waitTime.current = seconds
	}, [])

	/* Spinner component useEffect timer. No external state inputs */
	useEffect( () => {
		let tries = 7
		let sleepMs = 5000 //(sleepMs*2 <= 315000) // 6 tries over 5'15s

		const timercode = async () => {
			while(tries--){
				try{
					let res = await Axios.get('/api/enquiry', {
						params: {
							address: address
						}
					})

					if(res.status === 400 || res.status === 500){
						logger('spinner', 'Enquiry Error', res.data.error)
					}
			
					let data: EnquiryData = res.data

					if(data.processed){
						setIsProcessing(false)
						setProcessed(true)
						logger('spinner', 'processed', data)
						if(data.alreadyClaimed){
							setStatusMessage('You have already attempted a claim '+ data.handle)
							break;
						}
						if(!data.approved){
							setStatusMessage('Beep boop! We do not serve bots '+ data.handle)
							break;
						}
						setStatusMessage('Welcome ' + data.handle + '!')
						break;
					} 

					if(tries === 0){
						setIsProcessing(false)
						setProcessed(true)
						setStatusMessage('Sorry. No new tweet found on Twitter')
						break;
					}

					/* adjust wait timer */
					
					let wait = sleepMs + data.rateLimitWait
					//TODO: if rate-limit (waitTime) is set, give a "server busy" warning
					logger('spinner', address, 'waiting another', wait, 'ms...')
					setStatusMessage('Retrieving tweet data & processing...')

					waitTime.current = waitTime.current + wait
					nextTime.current = wait
					await sleep(wait) 
					sleepMs *= 2

				} catch(e){
					let res = e.response
					if(res.status === 429){
						logger('spinner', res.data)
						setIsProcessing(false)
						setProcessed(true)
						setStatusMessage(res.data)
						break;
					}
				}
			}
		}
		timercode()

		return () => {
			tries = 0
		}
	}, []) //<= reminder, no inputs go here

	return (
		<>
			<h1>{statusMessage}</h1>
			<br/>
			{isProcessing ?
				<>
					{/* <b>{seconds}/{waitTime.current}</b> */}
					<LinearProgress variant='determinate' value={(seconds/waitTime.current)*100}/>
					<p>Please wait another {Number(nextTime.current/1000).toFixed(0)} seconds</p>
				</>
				:
				<>
					{/* <LinearProgress variant='determinate' value={100} color='secondary' /> */}
					<h2>All steps completed - Let's see what your wallet can do!</h2>
					<div style={{display: 'flex', flexDirection: 'column', 
                    alignItems: 'center'}}>
						<button 
							className='btn primary' 
							onClick={()=> window.open('https://www.arweave.org/wallet/complete')}
							style={{marginTop: theme.spacing(1), marginRight: theme.spacing(1)}}
						>
							Explore
						</button>
					</div>
				</>
			}
		</>
	)
}
export default SpinnerStep

