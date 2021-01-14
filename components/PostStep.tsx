import { Button, Checkbox, Container, FormControlLabel, Typography } from '@material-ui/core'
import { GetServerSideProps } from 'next'
import React, { useState } from 'react'


interface IProps {
	address: string
	onClickNext: React.MouseEventHandler<HTMLButtonElement>
}

const PostStep = ({address, onClickNext}: IProps) => {

	const [disableNext, setDisableNext] = useState(true)

	const onClickTweet = async () => {

		const text = encodeURI("@ArweaveTeam ")

		const wref = window.open(
			`https://twitter.com/intent/tweet?text=${text}${address}`,
			"twitpostpopup",
			`left=${window.screenX + 100},top=${window.screenY + 100},width=500,height=448,toolbar=no`
		)


		setDisableNext(false)
	}

	return (
		<Container>
			<Typography variant='h4'>Post the tweet </Typography>
			<Typography variant='body1'>
				<ol>
					<li>Post the Tweet using your personal Twitter account</li>
					<li>Click next once done</li>
				</ol>
	
				<Button variant='contained' onClick={onClickTweet}>Open Tweet Pop-Up</Button>
				<br/>
				<br/>
				<Button disabled={disableNext} variant='contained' onClick={onClickNext}>Next</Button>
			</Typography>
		</Container>
	)
}
export default PostStep



