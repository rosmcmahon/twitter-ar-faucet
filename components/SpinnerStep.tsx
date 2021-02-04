import { LinearProgress, useTheme } from '@material-ui/core'
import Axios from 'axios'
import React, { useEffect, useRef, useState } from 'react'
import { EnquiryData } from '../types/api-responses'
import { logger } from '../utils/logger'
import { heartbeatOK } from '../components/checkHeartbeat'

const sleep = async (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms))

interface IProps {
	address: string
	seconds: number //ms
	setProcessed: (b: boolean) => void
	maintenanceOn: () => void
}

const SpinnerStep = ({address, seconds, setProcessed, maintenanceOn}: IProps) => {

	const theme = useTheme()
	const [statusMessage, setStatusMessage] = useState('Searching for Twitter post...')
	const [enableSubMessage, setEnableSubMessage] = useState(false)

	const waitTime = useRef(5)
	const nextTime = useRef(5)
	const [isProcessing, setIsProcessing] = useState(true)
	const [success, setSuccess] = useState(false)

	const [rateLimited, setRateLimited] = useState(false)

	// useEffect, run once 
	useEffect(() => {
		waitTime.current = seconds + 7
	}, [])

	/* Spinner component useEffect timer. No external state inputs */
	useEffect( () => {
		let tries = 7
		let sleepMs = 5000 //(sleepMs*2 <= 315000) // 6 tries over 5'15s

		const timercode = async () => {
			while(tries--){
				try{
					let heartbeat = await heartbeatOK()
					if(!heartbeat){
						maintenanceOn()
						break;
					}
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
							setStatusMessage('You have already attempted a claim.')
							break;
						}
						if(!data.approved){
							setStatusMessage('Beep boop! We do not serve bots. 🤖')
							setEnableSubMessage(true)
							break; 
						}
						setStatusMessage('Welcome to the permaweb!')
						setSuccess(true)
						break;
					} 

					if(tries === 0){
						setIsProcessing(false)
						setProcessed(true)
						setStatusMessage('Sorry. No new tweet found on Twitter.')
						break;
					}

					/* adjust wait timer */
					
					let wait = sleepMs + data.rateLimitWait

					// if rate-limit (waitTime) is set, give a "server busy" warnings
					if(data.rateLimitWait > 0){
						setProcessed(true) // prevent steps OutOfTime 5 minute timeout
						setRateLimited(true)	
					}

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
			{ (rateLimited && isProcessing) && 
				<>
					<h1>We are experiencing an unusually high demand for tokens! 🤖</h1>
					<h2>Your claim may take an extra 20 minutes to process. You can also check Twitter for a reply later.</h2>
				</>
			}	
			<h1>{statusMessage}</h1>
			{enableSubMessage && <p>If you feel that this is a mistake, please email us at <a href="mailto:team@arweave.org">team@arweave.org</a></p>}
			<br/>
			{isProcessing &&
				<>			
					{ (seconds/(waitTime.current)) <=1 ?
						<LinearProgress variant='determinate' value={((seconds-1)/waitTime.current)*100}/>
						:
						<LinearProgress variant='determinate' value={50}/>
					}
					{ (nextTime.current/1000) > 1 && 
						<p>Please wait another {Number(nextTime.current/1000).toFixed(0)} seconds</p>
					}
				</>
			}
			{ success &&
				<>
					{/* <LinearProgress variant='determinate' value={100} color='secondary' /> */}
					<h2>All steps completed - let's see what your wallet can do!</h2>
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

