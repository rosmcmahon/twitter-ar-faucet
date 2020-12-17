import { Button, Checkbox, Container, FormControlLabel, Typography } from '@material-ui/core'
import { GetServerSideProps } from 'next'
import React, { useState } from 'react'


interface IProps {
	address: string
	onClickNext: React.MouseEventHandler<HTMLButtonElement>
}

const Claim = ({address, onClickNext}: IProps) => {
	const [agree, setAgree] = useState<boolean>(false)
	const [disableTweet, setDisableTweet] = useState(true)
	const [disableNext, setDisableNext] = useState(true)

	const onClickTweet = async () => {

		const text = encodeURI("my nice message ")

		const wref = window.open(
			`https://twitter.com/intent/tweet?text=${text}${address}`,
			"twitpostpopup",
			`left=${window.screenX + 100},top=${window.screenY + 100},width=500,height=448,toolbar=no`
		)


		setDisableNext(false)
	}

	return (
		<Container>
			<Typography variant='h2'>Store data on the permaweb for free</Typography>
			<Typography variant='body1'>
				<p>You first need some Arweave tokens which we’d like to send you for free together with a wallet.</p>
				<p>You'll be amazed how far it'll go!</p>
				Instructions:
				<ol>
					<li>Post the Tweet using your Twitter account</li>
					<li>Click next once done</li>
				</ol>
				<FormControlLabel
					control={<Checkbox color='primary' checked={agree} onChange={(ev)=>{ setAgree(!agree); setDisableTweet(agree) }}/>}
					label='I agree to the privacy policy'
				/>
				<br/>
				<Button disabled={disableTweet} variant='contained' onClick={onClickTweet}>Claim tokens with Twitter</Button>
				<br/>
				<br/>
				<Button disabled={disableNext} variant='contained' onClick={onClickNext}>Next</Button>
			</Typography>
		</Container>
	)
}
export default Claim



