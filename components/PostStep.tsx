import { Typography } from '@material-ui/core'
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
		<>
			<h1>Post the tweet </h1>
			<Typography variant='body1'>
				<ol>
					<li>Post the Tweet using your personal Twitter account</li>
					<li>Click next once done</li>
				</ol>
	
				<button className='btn' onClick={onClickTweet}>Open Tweet Pop-Up</button>
				<br/>
			
				<button disabled={disableNext} className='btn' onClick={onClickNext}>Next</button>
			</Typography>
		</>
	)
}
export default PostStep


