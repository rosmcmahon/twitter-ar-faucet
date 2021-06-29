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
import { getRateLimitWait } from '../utils/ratelimit-singletons'
import TwitterLimit from '../components/TwitterLimit'
import { checkIP } from '../utils/fifo-ip'
import Maintenance from '../components/Maintenance'
import { getDbHeartbeat } from '../utils/db-heartbeat'
import { heartbeatOK } from '../components/checkHeartbeat'

const arweave = Arweave.init({ host: 'arweave.net' })

const ClaimStepper = ({ jwk, address, rateLimited, dbHeartbeat }: InferGetServerSidePropsType<typeof getServerSideProps>): ReactElement => {

  const theme = useTheme()
  const [activeStep, setActiveStep] = useState(0)
  const [seconds, setSeconds] = useState(0) // in milliseconds
  const [timesUp, setTimesUp] = useState(false)
  const [maintenance, setMaintenance] = useState(!dbHeartbeat)

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
  
  
	const onClickNext = async () => {
    const heartbeat = await heartbeatOK()
    if(!heartbeat){
      setMaintenance(true)
    } else {
      setActiveStep(step => step + 1)
    }
  }

  const maintenanceOn = () => setMaintenance(true)

  if(maintenance){
    return <Maintenance/>
  }
  if(rateLimited && activeStep < 1){
    return <TwitterLimit/>
  }
  if(timesUp){
    return <OutOfTime/>
  }
  return (
    <section className="card-link-section">
    <div className="card-link-section__inner center">
    <>
			<Stepper activeStep={activeStep} orientation='vertical' style={{marginBottom: theme.spacing(2)}}>
        <Step key={'download step'}>
          <StepLabel>Download your new wallet!</StepLabel>
					<StepContent>
            <DownloadStep 
              address={address} 
              jwk={jwk} 
              onClickNext={onClickNext}
            />
					</StepContent>
				</Step>
				<Step key={'post step'}>
          <StepLabel>Post the tweet</StepLabel>
					<StepContent>
            <PostStep 
              address={address} 
              onClickNext={onClickNext} 
            />
					</StepContent>
				</Step>
				<Step key={'spinner step'}>
          <StepLabel>Await tweet processing</StepLabel>
					<StepContent>
            <SpinnerStep 
              address={address} 
              seconds={seconds}
              setProcessed={setProcessed}
              maintenanceOn={maintenanceOn}
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

export const getServerSideProps: GetServerSideProps = async ({req, res}) => {
  
  const jwk = await arweave.wallets.generate()
  const address = await arweave.wallets.jwkToAddress(jwk)
  const rateLimited = (getRateLimitWait() > 0)
  const dbHeartbeat = await getDbHeartbeat()
  
  const ip = req.socket.remoteAddress
  logger(ip, 'STEPS PAGE LOAD', address, 'HB:'+dbHeartbeat, 'TwitterRL:'+rateLimited, new Date().toUTCString())

  if(!ip || (ip && !checkIP(ip))){
    logger(ip, 'REDIRECTING to index page')
    res.statusCode = 302
    res.setHeader('Location', '/')
    // res.end()
    return { props: {} };
  }

  
  /* Set off the server loop asynchronously */

  if(!rateLimited && dbHeartbeat){
    serverSideClaimProcessing(address) //async, never wait
  }

  return{
    props: {
      jwk,
      address,
      rateLimited,
      dbHeartbeat,
    }
  }
}
