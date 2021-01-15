import { Button, Checkbox, FormControlLabel, Paper, Typography, useTheme } from '@material-ui/core'
import { JWKInterface } from 'arweave/node/lib/wallet'
import { Container } from 'next/app'
import React, { ReactElement, useRef, useState } from 'react'


interface IProps {
	jwk: JWKInterface
	address: string
}
const DownloadStep = ({ jwk, address }: IProps): ReactElement => {

	const theme = useTheme()
	const [agree, setAgree] = useState<boolean>(false)
	const [disableDownload, setDisableDownload] = useState(true)
	const [downloadClicked, setDownloadClicked] = useState(false)

	const refDownloadAnchor = useRef<HTMLAnchorElement>(null)
  const filename = 'arweave-key-' + address + '.json'
  const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(jwk))

	return (
		<Container>
			<Typography variant="h4">Download your key file</Typography>

			<Typography variant='body1'>
				<p>
					Nobody (including the arweave project) can help you recover your wallet if the key file is lost.
				</p>
				<p><b>So, remember to keep it safe!</b></p>
			</Typography>

			<FormControlLabel
					control={<Checkbox checked={agree} onChange={(ev)=>{ 
						setAgree(!agree); 
						setDisableDownload(agree) }}/>}
				label='No one can help me recover this if I lose it'
			/>

			<Button disabled={disableDownload} variant='contained' onClick={(ev) => {
				refDownloadAnchor.current!.click()
				setDownloadClicked(true)
			}} >
				Download wallet
			</Button>
			<a
				ref={refDownloadAnchor} 
				href={dataUri} 
				download={filename} 
				target='_blank' 
				style={{visibility:'hidden',position:'absolute'}}
			>	{filename} </a>

			{downloadClicked && (
        <Paper square elevation={0} style={{ padding: theme.spacing(3) }}>
          <Typography>All steps completed - Let's see what your wallet can do!</Typography>
          <Button 
            variant='contained' color='primary'
            onClick={()=> window.open('https://www.arweave.org/wallet/complete')}
            style={{marginTop: theme.spacing(1), marginRight: theme.spacing(1)}}
          >
            Explore
          </Button>
        </Paper>
      )}

		</Container>
	)
}

export default DownloadStep
