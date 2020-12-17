import { Button, CircularProgress, Typography } from '@material-ui/core'
import React, { useEffect, useState } from 'react'

const sleep = async (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms))

interface IProps {
	onClickNext: React.MouseEventHandler<HTMLButtonElement>
}

const Spinner = ({onClickNext}: IProps) => {
	const [disableNext, setDisableNext] = useState(true)
	const [statusMessage, setStatusMessage] = useState('Processing...')

	useEffect( () => {
		const timercode = async () => {
			await sleep(10000)
			setStatusMessage('Finished!')
			setDisableNext(false)
		}
		timercode()
	}, [])

	return (
		<>
			<Typography variant='h2'>{statusMessage}</Typography>
			<CircularProgress size={100} thickness={3.6} /><br/>
			<CircularProgress size={100} thickness={3.6} variant='determinate' value={100} /><br/>
			<Button disabled={disableNext} variant='contained' onClick={onClickNext}>Next</Button>
		</>
	)
}
export default Spinner
