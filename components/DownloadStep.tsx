import { JWKInterface } from 'arweave/node/lib/wallet'
import React, { ReactElement, useRef, useState } from 'react'


interface IProps {
	jwk: JWKInterface
	address: string
	onClickNext: React.MouseEventHandler<HTMLButtonElement>
}
const DownloadStep = ({ jwk, address, onClickNext }: IProps): ReactElement => {

	const [agree, setAgree] = useState<boolean>(false)
	const [disableDownload, setDisableDownload] = useState(true)
	const [disableNext, setDisableNext] = useState(true)

	const refDownloadAnchor = useRef<HTMLAnchorElement>(null)
  const filename = 'arweave-key-' + address + '.json'
  const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(jwk))

	return (
		<>
			<h1>Download &amp; save your wallet key file.</h1>

			<p>
				Nobody (including the Arweave project) can help you recover your wallet if the key file is lost.
			</p>
			<p>So, remember to keep it safe!</p>
			<br/>

			<form noValidate={true}>
				<label 
					htmlFor='readyDl'
					className='checkbox-container'
				>
					<input 
						type='checkbox' 
						id='readyDl' name='readyDl' 
						value={agree.toString()}
						onChange={(ev)=>{ 
							setAgree(!agree); 
							setDisableDownload(agree) 
						}} 
					/>
					<span className='checkmark'/>
					I understand that one can help me recover this if I lose it
				</label>
			</form>

			<button 
				disabled={disableDownload} 
				className='btn'
				onClick={(ev) => {
					refDownloadAnchor.current!.click()
					setDisableNext(false)
				}} 
			>
				Download wallet
			</button>
			<a
				ref={refDownloadAnchor} 
				href={dataUri} 
				download={filename} 
				target='_blank' 
				style={{visibility:'hidden', position:'absolute'}}
			>	
				{filename} 
			</a>

			<br/>
			<button disabled={disableNext} className='btn' onClick={onClickNext}>
				Next
			</button>

		</>
	)
}

export default DownloadStep
