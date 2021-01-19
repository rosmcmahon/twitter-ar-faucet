import React, { ReactElement, useEffect, useRef, useState } from 'react'
import { Step, StepContent, StepLabel, Stepper, useTheme } from '@material-ui/core'
import Arweave from 'arweave'
import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import SpinnerStep from '../components/SpinnerStep'
import PostStep from '../components/PostStep'
import DownloadStep from '../components/DownloadStep'
import { serverSideClaimProcessing } from '../server/serverSide-processing'
import { logger } from '../utils/logger'
import OutOfTime from '../components/OutOfTime'

const arweave = Arweave.init({ host: 'arweave.net' })

const ClaimStepper = ({ jwk, address }: InferGetServerSidePropsType<typeof getServerSideProps>): ReactElement => {

  const theme = useTheme()
  const [activeStep, setActiveStep] = useState(0)
  const [seconds, setSeconds] = useState(0) // in milliseconds
  const [timesUp, setTimesUp] = useState(false)

  const processed = useRef(false)
  const setProcessed = (b: boolean) => processed.current = b

	/* useEffect that runs once/second to update `seconds` & render */
	useEffect(() => {
		const interval = 1000 // 1sec
		const timeout = setTimeout(() => {
			setSeconds(seconds + interval)
			if( (seconds >= 320*interval) && !processed.current){
				setTimesUp(true)
			}
		}, interval)
		return () => clearTimeout(timeout)
  }, [seconds])
  
  
  
  useEffect(() => logger('UI address', address), [])
  
	const onClickNext = () => setActiveStep(step => step + 1)

  if(timesUp){
    return <OutOfTime/>
  }
  return (
    <section className="card-link-section">
    <div className="card-link-section__inner center">
    <>
			<Stepper activeStep={activeStep} orientation='vertical' style={{marginBottom: theme.spacing(2)}}>
        <Step key={'download step'}>
          <StepLabel>Download Your New Wallet!</StepLabel>
					<StepContent>
						<DownloadStep address={address} jwk={jwk} onClickNext={onClickNext}/>
					</StepContent>
				</Step>
				<Step key={'post step'}>
          <StepLabel>Post the Tweet</StepLabel>
					<StepContent>
						<PostStep address={address} onClickNext={onClickNext}/>
					</StepContent>
				</Step>
				<Step key={'spinner step'}>
          <StepLabel>Await Tweet Processing</StepLabel>
					<StepContent>
            <SpinnerStep 
              address={address} 
              seconds={seconds}
              setProcessed={setProcessed}
            />
					</StepContent>
				</Step>
      </Stepper>
    </>
    </div>
    </section>
  )
}
export default ClaimStepper

export const getServerSideProps: GetServerSideProps = async (context) => {
  
  const jwk = await arweave.wallets.generate()
  const address = await arweave.wallets.jwkToAddress(jwk)
  
  logger(address, 'NEW PAGE LOAD', new Date().toUTCString())

  /* IP Blacklist Code */

  //get incoming IP address
  // console.log('connection', context.req.connection.remoteAddress) //https only
  logger(address, 'remoteAddress', context.req.socket.remoteAddress)
  /** TODO: 
   * - check against blacklist here. 
   * - keep list in db. 
   * - how do we quantify abuse?
   */
  
  /* Set off the server loop asynchronously */

  serverSideClaimProcessing(address) //async, never wait

  return{
    props: {
      jwk,
      address,
    }
  }
}
